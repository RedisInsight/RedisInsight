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
import { AiExtendedProvider } from 'src/modules/ai/extended/providers/ai-extended.provider';
import { AiExtendedMessageRepository } from 'src/modules/ai/extended/repositories/ai-extended.message.repository';
import { AiExtendedContextRepository } from 'src/modules/ai/extended/repositories/ai-extended.context.repository';
import {
  AiExtendedIntermediateStep,
  AiExtendedIntermediateStepType,
  AiExtendedMessage,
  AiExtendedMessageRole,
  AiExtendedMessageType,
  AiExtendedWsEvents,
} from 'src/modules/ai/extended/models';
import { SendAiExtendedMessageDto } from 'src/modules/ai/extended/dto/send.ai-extended.message.dto';
import { wrapAiExtendedError } from 'src/modules/ai/extended/exceptions';

const aiConfig = config.get('ai') as Config['ai'];

const COMMANDS_WHITELIST = {
  'ft.search': true,
  'ft.aggregate': true,
};

@Injectable()
export class AiExtendedService {
  private readonly logger = new Logger('AiExtendedService');

  constructor(
    private readonly aiExtendedProvider: AiExtendedProvider,
    private readonly databaseClientFactory: DatabaseClientFactory,
    private readonly aiExtendedMessageRepository: AiExtendedMessageRepository,
    private readonly aiExtendedContextRepository: AiExtendedContextRepository,
  ) {}

  static prepareHistoryIntermediateSteps(
    message: AiExtendedMessage,
  ): [AiExtendedMessageRole, string][] {
    const steps = [];
    message.steps.forEach((step) => {
      switch (step.type) {
        case AiExtendedIntermediateStepType.TOOL:
          steps.push([AiExtendedMessageRole.TOOL, step.data]);
          break;
        case AiExtendedIntermediateStepType.TOOL_CALL:
          steps.push([AiExtendedMessageRole.TOOL_CALL, step.data]);
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
          AiExtendedService.limitExtendedReply(
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

  static prepareHistory(messages: AiExtendedMessage[]): string[][] {
    const history = [];
    messages.forEach((message) => {
      switch (message.type) {
        case AiExtendedMessageType.AiMessage:
          history.push([AiExtendedMessageRole.AI, message.content]);
          if (message.steps.length) {
            history.push(
              ...AiExtendedService.prepareHistoryIntermediateSteps(message),
            );
          }
          break;
        case AiExtendedMessageType.HumanMessage:
          history.push([AiExtendedMessageRole.HUMAN, message.content]);
          break;
        default:
        // ignore
      }
    });

    return history;
  }

  static getConversationId(messages: AiExtendedMessage[]): string {
    return messages?.[messages.length - 1]?.conversationId || uuidv4();
  }

  async stream(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    dto: SendAiExtendedMessageDto,
    res: Response,
  ) {
    let socket: Socket;

    try {
      const history = await this.aiExtendedMessageRepository.list(databaseId);
      const conversationId = AiExtendedService.getConversationId(history);

      const client = await this.databaseClientFactory.getOrCreateClient({
        sessionMetadata,
        databaseId,
        context: ClientContext.AI,
      });

      let context = await this.aiExtendedContextRepository.getFullDbContext(
        sessionMetadata,
        databaseId,
      );

      if (!context) {
        context = await this.aiExtendedContextRepository.setFullDbContext(
          sessionMetadata,
          databaseId,
          await getFullDbContext(client),
        );
      }

      const question = classToClass(AiExtendedMessage, {
        type: AiExtendedMessageType.HumanMessage,
        content: dto.content,
        databaseId,
        conversationId,
        createdAt: new Date(),
      });

      const answer = classToClass(AiExtendedMessage, {
        type: AiExtendedMessageType.AiMessage,
        content: '',
        databaseId,
        conversationId,
      });

      socket = await this.aiExtendedProvider.getSocket();

      socket.on(AiExtendedWsEvents.REPLY_CHUNK, (chunk) => {
        answer.content += chunk;
        res.write(chunk);
      });

      socket.on(AiExtendedWsEvents.GET_INDEX, async (index, cb) => {
        try {
          const indexContext =
            await this.aiExtendedContextRepository.getIndexContext(
              sessionMetadata,
              databaseId,
              index,
            );

          if (!indexContext) {
            return cb(
              await this.aiExtendedContextRepository.setIndexContext(
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

      socket.on(AiExtendedWsEvents.RUN_QUERY, async (data, cb) => {
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

      socket.on(AiExtendedWsEvents.TOOL_CALL, async (data) => {
        answer.steps.push(
          plainToInstance(AiExtendedIntermediateStep, {
            type: AiExtendedIntermediateStepType.TOOL_CALL,
            data,
          }),
        );
      });

      socket.on(AiExtendedWsEvents.TOOL_REPLY, async (data) => {
        answer.steps.push(
          plainToInstance(AiExtendedIntermediateStep, {
            type: AiExtendedIntermediateStepType.TOOL,
            data,
          }),
        );
      });

      await new Promise((resolve, reject) => {
        socket.on(AiExtendedWsEvents.ERROR, async (error) => {
          reject(error);
        });

        socket
          .emitWithAck(
            AiExtendedWsEvents.STREAM,
            dto.content,
            context,
            AiExtendedService.prepareHistory(history),
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
      await this.aiExtendedMessageRepository.createMany([question, answer]);

      return res.end();
    } catch (e) {
      socket?.close?.();
      throw wrapAiExtendedError(e, 'Unable to send the question');
    }
  }

  async getHistory(
    _sessionMetadata: SessionMetadata,
    databaseId: string,
  ): Promise<AiExtendedMessage[]> {
    try {
      return await this.aiExtendedMessageRepository.list(databaseId);
    } catch (e) {
      this.logger.error('Unable to get history', e);
      throw wrapAiExtendedError(e, 'Unable to get history');
    }
  }

  async clearHistory(
    sessionMetadata: SessionMetadata,
    databaseId: string,
  ): Promise<void> {
    try {
      await this.aiExtendedContextRepository.reset(sessionMetadata, databaseId);

      return this.aiExtendedMessageRepository.clearHistory(databaseId);
    } catch (e) {
      throw wrapAiExtendedError(e, 'Unable to clear history');
    }
  }
}
