import { isArray } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { Socket } from 'socket.io-client';
import { Injectable, Logger } from '@nestjs/common';
import { ClientContext, SessionMetadata } from 'src/common/models';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import {
  getFullDbContext,
  getIndexContext,
} from 'src/modules/ai/query/utils/context.util';
import { Response } from 'express';
import { classToClass, Config } from 'src/utils';
import { plainToInstance } from 'class-transformer';
import config from 'src/utils/config';
import { AiDataGeneratorProvider } from 'src/modules/ai/data-generator/providers/ai-data-generator.provider';
import { AiDataGeneratorMessageRepository } from 'src/modules/ai/data-generator/repositories/ai-data-generator.message.repository';
import { AiDataGeneratorContextRepository } from 'src/modules/ai/data-generator/repositories/ai-data-generator.context.repository';
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

const aiConfig = config.get('ai') as Config['ai'];

const COMMANDS_WHITELIST = {
  'ft.search': true,
  'ft.aggregate': true,
};

@Injectable()
export class AiDataGeneratorService {
  private readonly logger = new Logger('AiDataGeneratorService');

  constructor(
    private readonly aiDataGeneratorProvider: AiDataGeneratorProvider,
    private readonly databaseClientFactory: DatabaseClientFactory,
    private readonly aiDataGeneratorMessageRepository: AiDataGeneratorMessageRepository,
    private readonly aiDataGeneratorContextRepository: AiDataGeneratorContextRepository,
  ) {}

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
              ...AiDataGeneratorService.prepareHistoryIntermediateSteps(message),
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
      const history = await this.aiDataGeneratorMessageRepository.list(databaseId);
      const conversationId = AiDataGeneratorService.getConversationId(history);

      const client = await this.databaseClientFactory.getOrCreateClient({
        sessionMetadata,
        databaseId,
        context: ClientContext.AI,
      });

      let context = await this.aiDataGeneratorContextRepository.getFullDbContext(
        sessionMetadata,
        databaseId,
      );

      if (!context) {
        context = await this.aiDataGeneratorContextRepository.setFullDbContext(
          sessionMetadata,
          databaseId,
          await getFullDbContext(client),
        );
      }

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

      socket.on(AiDataGeneratorWsEvents.GET_INDEX, async (index, cb) => {
        try {
          const indexContext =
            await this.aiDataGeneratorContextRepository.getIndexContext(
              sessionMetadata,
              databaseId,
              index,
            );

          if (!indexContext) {
            return cb(
              await this.aiDataGeneratorContextRepository.setIndexContext(
                sessionMetadata,
                databaseId,
                index,
                await getIndexContext(client, index),
              ),
            );
          }

          return cb(indexContext);
        } catch (e) {
          this.logger.warn(
            'Unable to create index context',
            e,
            sessionMetadata,
          );
          return cb(e.message);
        }
      });

      socket.on(AiDataGeneratorWsEvents.RUN_QUERY, async (data, cb) => {
        try {
          if (!COMMANDS_WHITELIST[(data?.[0] || '').toLowerCase()]) {
            return cb('-ERR: This command is not allowed');
          }

          return cb(await client.sendCommand(data, { replyEncoding: 'utf8' }));
        } catch (e) {
          this.logger.warn('Extended execution error', e, sessionMetadata);
          return cb(e.message);
        }
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

      await new Promise((resolve, reject) => {
        socket.on(AiDataGeneratorWsEvents.ERROR, async (error) => {
          reject(error);
        });

        socket
          .emitWithAck(
            AiDataGeneratorWsEvents.STREAM,
            dto.content,
            context,
            AiDataGeneratorService.prepareHistory(history),
            {
              conversationId,
            },
          )
          .then((ack) => {
            if (ack?.error) {
              return reject(ack.error);
            }

            return resolve(ack);
          })
          .catch(reject);
      });
      socket.close();
      await this.aiDataGeneratorMessageRepository.createMany([question, answer]);

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
    sessionMetadata: SessionMetadata,
    databaseId: string,
  ): Promise<void> {
    try {
      await this.aiDataGeneratorContextRepository.reset(sessionMetadata, databaseId);

      return this.aiDataGeneratorMessageRepository.clearHistory(databaseId);
    } catch (e) {
      throw wrapAiDataGeneratorError(e, 'Unable to clear history');
    }
  }
} 