import { isArray } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { Socket } from 'socket.io-client';
import { Injectable, Logger } from '@nestjs/common';
import { ClientContext, SessionMetadata } from 'src/common/models';
import { AiProvider } from 'src/modules/ai/providers/ai.provider';
// import { SendAiDatabaseMessageDto, SendAiMessageDto } from 'src/modules/ai/dto/send.ai.message.dto';
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
import { AiMessageDto } from './dto/send.ai.message.dto';
import { AiAgreement } from './models/ai.agreement';
import { AiAgreementRepository } from './repositories/ai.agreement.repository';
import { UpdateAiAgreementsDto } from './dto/update.ai.agreements.dto';

const aiConfig = config.get('ai') as Config['ai'];

const COMMANDS_WHITELIST = {
  'ft.search': true,
  'ft.aggregate': true,
};

const NO_AI_AGREEMENT_ERROR = 'Permission to run a query was not granted';

@Injectable()
export class AiService {
  private readonly logger = new Logger('AiService');

  constructor(
    private readonly aiProvider: AiProvider,
    private readonly databaseClientFactory: DatabaseClientFactory,
    private readonly aiMessageRepository: AiMessageRepository,
    private readonly aiAuthProvider: AiAuthProvider,
    private readonly aiContextRepository: AiContextRepository,
    private readonly aiAgreementRepository: AiAgreementRepository,
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

  async streamMessage(
    sessionMetadata: SessionMetadata,
    databaseId: Nullable<string>,
    dto: AiMessageDto,
    res: Response,
  ) {
    return this.aiAuthProvider.callWithAuthRetry(sessionMetadata, async () => {
      let socket: Socket;

      try {
        const auth = await this.aiAuthProvider.getAuthData(sessionMetadata);
        const history = await this.aiMessageRepository.list(sessionMetadata, databaseId, auth.accountId);
        const conversationId = AiService.getConversationId(history);

        const client = await this.databaseClientFactory.getOrCreateClient({
          sessionMetadata,
          databaseId,
          context: ClientContext.AI,
        });

        const agreement = await this.aiAgreementRepository.get(databaseId, auth.accountId);

        const context = agreement ? await this.getContext(sessionMetadata, databaseId, auth, client)
          : { error: NO_AI_AGREEMENT_ERROR };

        const question = classToClass(AiMessage, {
          type: AiMessageType.HumanMessage,
          content: dto.content,
          databaseId,
          conversationId,
          accountId: auth.accountId,
          createdAt: new Date(),
        });

        const answer = classToClass(AiMessage, {
          type: AiMessageType.AiMessage,
          content: '',
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
            if (!agreement) return cb({ error: NO_AI_AGREEMENT_ERROR });
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
            if (!agreement) return cb(`-ERR: ${NO_AI_AGREEMENT_ERROR}`);
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

  async streamGeneralMessage(
    sessionMetadata: SessionMetadata,
    dto: AiMessageDto,
    res: Response,
  ) {
    return this.aiAuthProvider.callWithAuthRetry(sessionMetadata, async () => {
      let socket: Socket;

      try {
        const auth = await this.aiAuthProvider.getAuthData(sessionMetadata);
        const history = await this.aiMessageRepository.list(sessionMetadata, null, auth.accountId);
        const conversationId = AiService.getConversationId(history);

        const question = classToClass(AiMessage, {
          type: AiMessageType.HumanMessage,
          content: dto.content,
          databaseId: null,
          conversationId,
          accountId: auth.accountId,
          createdAt: new Date(),
        });

        const answer = classToClass(AiMessage, {
          type: AiMessageType.AiMessage,
          content: '',
          databaseId: null,
          conversationId,
          accountId: auth.accountId,
        });

        socket = await this.aiProvider.getSocket(auth);

        socket.on(AiWsEvents.REPLY_CHUNK, (chunk) => {
          answer.content += chunk;
          res.write(chunk);
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
            AiWsEvents.GENERAL,
            dto.content,
            {},
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

  async listAiAgreements(sessionMetadata: SessionMetadata): Promise<AiAgreement[]> {
    return this.aiAuthProvider.callWithAuthRetry(sessionMetadata, async () => {
      try {
        const auth = await this.aiAuthProvider.getAuthData(sessionMetadata);
        // const auth = { accountId: '1234' };
        return await this.aiAgreementRepository.list(auth.accountId);
      } catch (e) {
        throw wrapAiError(e, 'Unable to get Ai Agreements');
      }
    });
  }

  async updateAiAgreements(
    sessionMetadata: SessionMetadata,
    databaseId: Nullable<string>,
    reqDto: UpdateAiAgreementsDto,
  ): Promise<AiAgreement[]> {
    return this.aiAuthProvider.callWithAuthRetry(sessionMetadata, async () => {
      try {
        this.logger.log('Updating Ai Agreements data');
        const auth = await this.aiAuthProvider.getAuthData(sessionMetadata);
        const generalAiAgreement = await this.aiAgreementRepository.get(null, auth.accountId);
        if (reqDto.general) {
          if (!generalAiAgreement) {
            await this.aiAgreementRepository.create(null, auth.accountId);
          }
        } else if (generalAiAgreement) {
          await this.aiAgreementRepository.delete(null, auth.accountId);
        }

        if (databaseId) {
          const dbAiAgreement = await this.aiAgreementRepository.get(databaseId, auth.accountId);
          if (reqDto.db) {
            if (!dbAiAgreement) {
              await this.aiAgreementRepository.create(databaseId, auth.accountId);
            }
          } else if (dbAiAgreement) {
            await this.aiAgreementRepository.delete(databaseId, auth.accountId);
          }
        }

        return await this.listAiAgreements(sessionMetadata);
      } catch (e) {
        throw wrapAiError(e, 'Unable to update Ai Agrements');
      }
    });
  }
}
