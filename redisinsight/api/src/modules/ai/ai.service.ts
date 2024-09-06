import { isArray } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { Socket } from 'socket.io-client';
import { Injectable, Logger } from '@nestjs/common';
import { ClientContext, SessionMetadata } from 'src/common/models';
import { AiProvider } from 'src/modules/ai/providers/ai.provider';
import { SendAiDatabaseMessageDto, SendAiMessageDto } from 'src/modules/ai/dto/send.ai.message.dto';
import { wrapAiError } from 'src/modules/ai/exceptions';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import { getFullDbContext, getIndexContext } from 'src/modules/ai/utils/context.util';
import { Response } from 'express';
import {
  AiMessage,
  AiMessageType,
  AiMessageRole,
  AiWsEvents,
  AiIntermediateStepType,
  AiIntermediateStep,
  AiAuthData,
} from 'src/modules/ai/models';
import { AiMessageRepository } from 'src/modules/ai/repositories/ai.message.repository';
import { AiAuthProvider } from 'src/modules/ai/providers/auth/ai-auth.provider';
import { classToClass, Config } from 'src/utils';
import { plainToClass } from 'class-transformer';
import { AiContextRepository } from 'src/modules/ai/repositories/ai.context.repository';
import config from 'src/utils/config';
import { Nullable } from 'src/common/constants';
import { RedisClient } from 'src/modules/redis/client';

const aiConfig = config.get('ai') as Config['ai'];

const COMMANDS_WHITELIST = {
  'ft.search': true,
  'ft.aggregate': true,
};

@Injectable()
export class AiService {
  private readonly logger = new Logger('AiService');

  constructor(
    private readonly aiProvider: AiProvider,
    private readonly databaseClientFactory: DatabaseClientFactory,
    private readonly aiMessageRepository: AiMessageRepository,
    private readonly aiAuthProvider: AiAuthProvider,
    private readonly aiContextRepository: AiContextRepository,
  ) {}

  static prepareHistoryIntermediateSteps(message: AiMessage): [AiMessageRole, string][] {
    const steps = [];
    message.steps.forEach((step) => {
      switch (step.type) {
        case AiIntermediateStepType.TOOL:
          steps.push([AiMessageRole.TOOL, step.data]);
          break;
        case AiIntermediateStepType.TOOL_CALL:
          steps.push([AiMessageRole.TOOL_CALL, step.data]);
          break;
        default:
          // ignore
      }
    });

    return steps;
  }

  static limitQueryReply(reply: any, maxResults = aiConfig.maxResults) {
    let results = reply;
    if (isArray(reply)) {
      results = reply.slice(0, maxResults);
      results = results.map((nested) => {
        if (Array.isArray(nested)) {
          AiService.limitQueryReply(nested, aiConfig.maxNestedElements);
        }
        return nested;
      });
      return results;
    }

    return results;
  }

  static prepareHistory(messages: AiMessage[]): string[][] {
    const history = [];
    messages.forEach((message) => {
      switch (message.type) {
        case AiMessageType.AiMessage:
          history.push([AiMessageRole.AI, message.content]);
          if (message.steps.length) {
            history.push(...AiService.prepareHistoryIntermediateSteps(message));
          }
          break;
        case AiMessageType.HumanMessage:
          history.push([AiMessageRole.HUMAN, message.content]);
          break;
        default:
          // ignore
      }
    });

    return history;
  }

  static getConversationId(messages: AiMessage[]): string {
    return messages?.[messages.length - 1]?.conversationId || uuidv4();
  }

  private async getContext(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    auth: AiAuthData,
    client: RedisClient,
  ) {
    let context = await this.aiContextRepository.getFullDbContext(sessionMetadata, databaseId, auth.accountId);

    if (!context) {
      context = await this.aiContextRepository.setFullDbContext(
        sessionMetadata,
        databaseId,
        auth.accountId,
        await getFullDbContext(client),
      );
    }

    return context;
  }

  async stream(
    sessionMetadata: SessionMetadata,
    databaseId: Nullable<string>,
    dto: SendAiMessageDto | SendAiDatabaseMessageDto,
    res: Response,
  ) {
    return this.aiAuthProvider.callWithAuthRetry(sessionMetadata, async () => {
      let socket: Socket;

      try {
        let client = null;
        let context = {};

        const auth = await this.aiAuthProvider.getAuthData(sessionMetadata);
        const history = await this.aiMessageRepository.list(sessionMetadata, databaseId, auth.accountId);
        const conversationId = AiService.getConversationId(history);

        if (databaseId) {
          client = await this.databaseClientFactory.getOrCreateClient({
            sessionMetadata,
            databaseId,
            context: ClientContext.AI,
          });

          context = await this.getContext(sessionMetadata, databaseId, auth, client);
        }

        const question = classToClass(AiMessage, {
          type: AiMessageType.HumanMessage,
          content: dto.content,
          tool: dto.tool,
          databaseId,
          conversationId,
          accountId: auth.accountId,
          createdAt: new Date(),
        });

        const answer = classToClass(AiMessage, {
          type: AiMessageType.AiMessage,
          content: '',
          tool: dto.tool,
          databaseId,
          conversationId,
          accountId: auth.accountId,
        });

        socket = await this.aiProvider.getSocket(auth);

        socket.on(AiWsEvents.REPLY_CHUNK, (chunk) => {
          answer.content += chunk;
          res.write(chunk);
        });

        socket.on(AiWsEvents.GET_INDEX, async (index, cb) => {
          try {
            const indexContext = await this.aiContextRepository.getIndexContext(
              sessionMetadata,
              databaseId,
              auth.accountId,
              index,
            );

            if (!indexContext) {
              return cb(await this.aiContextRepository.setIndexContext(
                sessionMetadata,
                databaseId,
                auth.accountId,
                index,
                await getIndexContext(client, index),
              ));
            }

            return cb(indexContext);
          } catch (e) {
            this.logger.warn('Unable to create index context', e);
            return cb(e.message);
          }
        });

        socket.on(AiWsEvents.RUN_QUERY, async (data, cb) => {
          try {
            if (!COMMANDS_WHITELIST[(data?.[0] || '').toLowerCase()]) {
              return cb('-ERR: This command is not allowed');
            }

            return cb(await client?.sendCommand(data, { replyEncoding: 'utf8' }));
          } catch (e) {
            this.logger.warn('Query execution error', e);
            return cb(e.message);
          }
        });

        socket.on(AiWsEvents.TOOL_CALL, async (data) => {
          answer.steps.push(plainToClass(AiIntermediateStep, {
            type: AiIntermediateStepType.TOOL_CALL,
            data,
          }));
        });

        socket.on(AiWsEvents.TOOL_REPLY, async (data) => {
          answer.steps.push(plainToClass(AiIntermediateStep, {
            type: AiIntermediateStepType.TOOL,
            data,
          }));
        });

        await new Promise((resolve, reject) => {
          socket.on(AiWsEvents.ERROR, async (error) => {
            reject(error);
          });

          socket.emitWithAck(
            AiWsEvents.STREAM,
            dto.content,
            context,
            AiService.prepareHistory(history),
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

        await this.aiMessageRepository.createMany(sessionMetadata, [question, answer]);

        return res.end();
      } catch (e) {
        socket?.close?.();
        throw wrapAiError(e, 'Unable to send the question');
      }
    });
  }

  async getHistory(sessionMetadata: SessionMetadata, databaseId: Nullable<string>): Promise<AiMessage[]> {
    return this.aiAuthProvider.callWithAuthRetry(sessionMetadata, async () => {
      try {
        const auth = await this.aiAuthProvider.getAuthData(sessionMetadata);
        return await this.aiMessageRepository.list(sessionMetadata, databaseId, auth.accountId);
      } catch (e) {
        throw wrapAiError(e, 'Unable to get history');
      }
    });
  }

  async clearHistory(sessionMetadata: SessionMetadata, databaseId: Nullable<string>): Promise<void> {
    return this.aiAuthProvider.callWithAuthRetry(sessionMetadata, async () => {
      try {
        const auth = await this.aiAuthProvider.getAuthData(sessionMetadata);

        if (databaseId) {
          await this.aiContextRepository.reset(sessionMetadata, databaseId, auth.accountId);
        }

        return this.aiMessageRepository.clearHistory(sessionMetadata, databaseId, auth.accountId);
      } catch (e) {
        throw wrapAiError(e, 'Unable to clear history');
      }
    });
  }
}
