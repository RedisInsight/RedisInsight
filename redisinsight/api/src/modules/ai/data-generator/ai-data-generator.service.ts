import { isArray } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { Socket } from 'socket.io-client';
import { Injectable, Logger } from '@nestjs/common';
import { ClientContext, SessionMetadata } from 'src/common/models';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import { Response } from 'express';
import { classToClass, Config } from 'src/utils';
import { plainToInstance } from 'class-transformer';
import config from 'src/utils/config';
import { AiDataGeneratorProvider } from 'src/modules/ai/data-generator/providers/ai-data-generator.provider';
import { AiDataGeneratorMessageRepository } from 'src/modules/ai/data-generator/repositories/ai-data-generator.message.repository';
import {
  AiDataGeneratorIntermediateStep,
  AiDataGeneratorIntermediateStepType,
  AiDataGeneratorMessage,
  AiDataGeneratorMessageRole,
  AiDataGeneratorMessageType,
  AiDataGeneratorWsEvents,
} from 'src/modules/ai/data-generator/models';
import { SendAiDataGeneratorMessageDto } from 'src/modules/ai/data-generator/dto/send.ai-data-generator.message.dto';
import { wrapAiDataGeneratorError } from 'src/modules/ai/data-generator/exceptions';
import * as ivm from 'isolated-vm';
import { RedisClient } from 'src/modules/redis/client';
import { NotificationServerEvents } from 'src/modules/notification/constants';
import { NotificationsDto } from 'src/modules/notification/dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

const aiConfig = config.get('ai') as Config['ai'];

@Injectable()
export class AiDataGeneratorService {
  private readonly logger = new Logger('AiDataGeneratorService');

  constructor(
    private readonly aiDataGeneratorProvider: AiDataGeneratorProvider,
    private readonly databaseClientFactory: DatabaseClientFactory,
    private readonly aiDataGeneratorMessageRepository: AiDataGeneratorMessageRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private sendImportProgress(id: string, total: number, processed: number) {
    if (total > 30_000) {
      this.eventEmitter.emit(
        NotificationServerEvents.AITool,
        plainToInstance(NotificationsDto, {
          tool: AiDataGeneratorWsEvents.EXECUTE_SNIPPET,
          data: {
            id,
            processed,
            total,
          },
        }),
      );
    }
  }

  private async runUserCode(
    client: RedisClient,
    code: string,
    total = 0,
  ) {
    const id = uuidv4();
    let processed = 0;
    this.sendImportProgress(id, total, processed);

    // Create a callback function in the main process
    const streamChunk = new ivm.Reference(async (data) => {
      try {
        // console.log('parsing chunk')
        const chunk = JSON.parse(data);
        processed += chunk.length || 0;
        console.log(`✅ chunk has ${chunk?.length} commands`)

        // console.log('✅ Received chunk:', chunk);

        const result = await client.sendPipeline(chunk);
        // console.log('insert chunk result: ', result)
      } catch (e) {
        console.log('unable to execute pipeline', e)
        // ignore error for now
      }

      this.sendImportProgress(id, total, processed);
    });

    const isolate = new ivm.Isolate({ memoryLimit: 512 }); // 8 MB
    const context = await isolate.createContext();

    const jail = context.global;
    await jail.set('global', jail.derefInto());

    // Set the function in the sandbox
    await jail.set('sendChunk', streamChunk);

    try {
      const codeSnippet = `
      (async function untrusted() {
        class Commands {
          batchSize = 3000;

          toSend = [];

          async send() {
            if (this.toSend.length) {
              await sendChunk.applySyncPromise(undefined, [JSON.stringify(this.toSend)]);
              this.toSend = [];
            }
          }

          async push(commands) {
            this.toSend.push(commands);
            if (this.toSend.length >= this.batchSize) {
              await this.send();
            }
          }
        }

        const commands = new Commands();

        ${code}

        await commands.send();
      })();
      `;

      console.log('Executing codeSnippet: \n', codeSnippet)
      const script = await isolate.compileScript(codeSnippet);
      // console.log('___ script generated')
      const result = await script.run(context, { timeout: 120_000, promise: true }); // 2 mins
      // console.log('Result:', result);

      this.sendImportProgress(id, total, total); // processed = total

      return result;
    } catch (err) {
      this.sendImportProgress(id, total, total); // processed = total

      console.error('Error executing user code:', err.message);
    }
  }

  static prepareHistoryIntermediateSteps(
    message: AiDataGeneratorMessage,
  ): [AiDataGeneratorMessageRole, string][] {
    const steps = [];
    message.steps.forEach((step) => {
      switch (step.type) {
        case AiDataGeneratorIntermediateStepType.TOOL:
          steps.push([AiDataGeneratorMessageRole.TOOL, step.data]);
          break;
        case AiDataGeneratorIntermediateStepType.TOOL_CALL:
          steps.push([AiDataGeneratorMessageRole.TOOL_CALL, step.data]);
          break;
        default:
        // ignore
      }
    });

    return steps;
  }

  static limitExtendedReply(reply: any, maxResults = aiConfig.queryMaxResults) {
    let results = reply;
    if (isArray(reply)) {
      results = reply.slice(0, maxResults);
      results = results.map((nested: any) => {
        if (Array.isArray(nested)) {
          AiDataGeneratorService.limitExtendedReply(
            nested,
            aiConfig.queryMaxNestedElements,
          );
        }
        return nested;
      });
      return results;
    }

    return results;
  }

  static prepareHistory(messages: AiDataGeneratorMessage[]): string[][] {
    const history = [];
    messages.forEach((message) => {
      switch (message.type) {
        case AiDataGeneratorMessageType.AiMessage:
          history.push([AiDataGeneratorMessageRole.AI, message.content]);
          if (message.steps.length) {
            history.push(
              ...AiDataGeneratorService.prepareHistoryIntermediateSteps(
                message,
              ),
            );
          }
          break;
        case AiDataGeneratorMessageType.HumanMessage:
          history.push([AiDataGeneratorMessageRole.HUMAN, message.content]);
          break;
        default:
        // ignore
      }
    });

    return history;
  }

  static getConversationId(messages: AiDataGeneratorMessage[]): string {
    return messages?.[messages.length - 1]?.conversationId || uuidv4();
  }

  async stream(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    dto: SendAiDataGeneratorMessageDto,
    res: Response,
  ) {
    let socket: Socket;

    try {
      const history =
        await this.aiDataGeneratorMessageRepository.list(databaseId);
      const conversationId = AiDataGeneratorService.getConversationId(history);

      const client = await this.databaseClientFactory.getOrCreateClient({
        sessionMetadata,
        databaseId,
        context: ClientContext.AI,
      });

      const context = { redis_version: '7.4' };

      const question = classToClass(AiDataGeneratorMessage, {
        type: AiDataGeneratorMessageType.HumanMessage,
        content: dto.content,
        databaseId,
        conversationId,
        createdAt: new Date(),
      });

      const answer = classToClass(AiDataGeneratorMessage, {
        type: AiDataGeneratorMessageType.AiMessage,
        content: '',
        databaseId,
        conversationId,
      });

      socket = await this.aiDataGeneratorProvider.getSocket();

      socket.on(AiDataGeneratorWsEvents.REPLY_CHUNK, (chunk) => {
        answer.content += chunk;
        res.write(chunk);
      });

      socket.on(AiDataGeneratorWsEvents.TOOL_CALL, async (data) => {
        answer.steps.push(
          plainToInstance(AiDataGeneratorIntermediateStep, {
            type: AiDataGeneratorIntermediateStepType.TOOL_CALL,
            data,
          }),
        );
      });

      socket.on(AiDataGeneratorWsEvents.TOOL_REPLY, async (data) => {
        answer.steps.push(
          plainToInstance(AiDataGeneratorIntermediateStep, {
            type: AiDataGeneratorIntermediateStepType.TOOL,
            data,
          }),
        );
      });

      socket.on(AiDataGeneratorWsEvents.EXECUTE_SNIPPET, async ({ codeSnippet, totalCommands }, cb) => {
        try {
          console.log('Going to execute code snippet', codeSnippet)
          const result = await this.runUserCode(client, codeSnippet, totalCommands);
          console.log('___ result', result)
          cb({
            created: 100,
          })
        } catch (e) {
          console.log('____ error running code snippet', e)
          cb({ error: 'some error happened '})
        }
      });

      await new Promise((resolve, reject) => {
        socket.on(AiDataGeneratorWsEvents.ERROR, async (error) => {
          reject(error);
        });

        socket
          .emitWithAck(AiDataGeneratorWsEvents.STREAM, {
            message: dto.content,
            context,
            history: AiDataGeneratorService.prepareHistory(history),
          })
          .then((ack) => {
            if (ack?.error) {
              return reject(ack.error);
            }

            return resolve(ack);
          })
          .catch(reject);
      });
      socket.close();
      await this.aiDataGeneratorMessageRepository.createMany([
        question,
        answer,
      ]);

      return res.end();
    } catch (e) {
      socket?.close?.();
      throw wrapAiDataGeneratorError(e, 'Unable to send the question');
    }
  }

  async getHistory(
    _sessionMetadata: SessionMetadata,
    databaseId: string,
  ): Promise<AiDataGeneratorMessage[]> {
    try {
      return await this.aiDataGeneratorMessageRepository.list(databaseId);
    } catch (e) {
      this.logger.error('Unable to get history', e);
      throw wrapAiDataGeneratorError(e, 'Unable to get history');
    }
  }

  async clearHistory(
    _: SessionMetadata,
    databaseId: string,
  ): Promise<void> {
    try {
      return this.aiDataGeneratorMessageRepository.clearHistory(databaseId);
    } catch (e) {
      throw wrapAiDataGeneratorError(e, 'Unable to clear history');
    }
  }
}
