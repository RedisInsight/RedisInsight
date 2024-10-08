import { isArray } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { Socket } from 'socket.io-client';
import { Injectable, Logger } from '@nestjs/common';
import { ClientContext, SessionMetadata } from 'src/common/models';
import { AiMessageProvider } from 'src/modules/ai/messages/providers/ai.message.provider';
import { AiForbiddenException, wrapAiError } from 'src/modules/ai/exceptions';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import { getFullDbContext, getIndexContext } from 'src/modules/ai/messages/utils/context.util';
import { Response } from 'express';
import {
  AiMessage,
  AiMessageType,
  AiMessageRole,
  AiWsEvents,
  AiIntermediateStepType,
  AiIntermediateStep,
} from 'src/modules/ai/messages/models';
import { AiMessageRepository } from 'src/modules/ai/messages/repositories/ai.message.repository';
import { AiAuthProvider } from 'src/modules/ai/auth/ai-auth.provider';
import { classToClass } from 'src/utils';
import { plainToClass } from 'class-transformer';
import { AiContextRepository } from 'src/modules/ai/messages/repositories/ai.context.repository';

import { Nullable } from 'src/common/constants';
import { AiMessageDto } from './dto/send.ai.message.dto';
import {
  COMMANDS_WHITELIST, GetContextProps, NO_AI_AGREEMENT_ERROR, NO_GENERAL_AGREEEMENT_ERROR, aiConfig,
} from './constants';
import { AiDatabaseAgreementRepository } from '../agreements/repositories/ai.database.agreement.repository';
import { AiAgreementRepository } from '../agreements/repositories/ai.agreement.repository';

@Injectable()
export class AiMessageService {
  private readonly logger = new Logger('AiService');

  constructor(
    private readonly aiMessageProvider: AiMessageProvider,
    private readonly databaseClientFactory: DatabaseClientFactory,
    private readonly aiMessageRepository: AiMessageRepository,
    private readonly aiAuthProvider: AiAuthProvider,
    private readonly aiAgreementRepository: AiAgreementRepository,
    private readonly aiDatabaseAgreementRepository: AiDatabaseAgreementRepository,
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
          AiMessageService.limitQueryReply(nested, aiConfig.maxNestedElements);
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
            history.push(...AiMessageService.prepareHistoryIntermediateSteps(message));
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
    contextParams: GetContextProps,
  ) {
    try {
      const {
        databaseId, auth, client, databaseAgreement,
      } = contextParams;
      if (!databaseAgreement?.dataConsent) {
        return { error: NO_AI_AGREEMENT_ERROR };
      }

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
    } catch (e) {
      // TODO handle errors if needed
      return { error: e.message };
    }
  }

  private async getIndexContext(
    sessionMetadata: SessionMetadata,
    indexContextParams: GetContextProps,
    index: string,
  ) {
    try {
      const {
        databaseAgreement, databaseId, auth, client,
      } = indexContextParams;
      if (!databaseAgreement?.dataConsent) {
        return { error: NO_AI_AGREEMENT_ERROR };
      }

      const indexContext = await this.aiContextRepository.getIndexContext(
        sessionMetadata,
        databaseId,
        auth.accountId,
        index,
      );

      if (!indexContext) {
        return await this.aiContextRepository.setIndexContext(
          sessionMetadata,
          databaseId,
          auth.accountId,
          index,
          await getIndexContext(client, index),
        );
      }

      return indexContext;
    } catch (e) {
      this.logger.warn('Unable to create index context', e);
      // TODO handle errors if needed
      return { error: e.message };
    }
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

        const generalAgreement = await this.aiAgreementRepository.get(sessionMetadata, auth.accountId);
        if (!generalAgreement?.consent) {
          throw new AiForbiddenException(NO_GENERAL_AGREEEMENT_ERROR);
        }

        const history = await this.aiMessageRepository.list(sessionMetadata, databaseId, auth.accountId);
        const conversationId = AiMessageService.getConversationId(history);
        const databaseAgreement = await this.aiDatabaseAgreementRepository.get(
          sessionMetadata,
          databaseId,
          auth.accountId,
        );

        // Client can be moved to getContext
        const client = await this.databaseClientFactory.getOrCreateClient({
          sessionMetadata,
          databaseId,
          context: ClientContext.AI,
        });

        const contextParams: GetContextProps = {
          databaseId,
          auth,
          client,
          databaseAgreement,
        };

        const context = await this.getContext(sessionMetadata, contextParams);

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

        socket = await this.aiMessageProvider.getSocket(auth);

        socket.on(AiWsEvents.GET_INDEX, async (index, cb) => {
          await cb(await this.getIndexContext(
            sessionMetadata,
            contextParams,
            index,
          ));
        });

        socket.on(AiWsEvents.RUN_QUERY, async (data, cb) => {
          try {
            if (!databaseAgreement?.dataConsent) {
              return cb(`-ERR: ${NO_AI_AGREEMENT_ERROR}`);
            }

            if (!COMMANDS_WHITELIST[(data?.[0] || '').toLowerCase()]) {
              return cb('-ERR: This command is not allowed');
            }

            return cb(await client?.sendCommand(data, { replyEncoding: 'utf8' }));
          } catch (e) {
            this.logger.warn('Query execution error', e);
            return cb(e.message);
          }
        });

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
            AiWsEvents.STREAM,
            dto.content,
            context,
            AiMessageService.prepareHistory(history),
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

        const generalAgreement = await this.aiAgreementRepository.get(sessionMetadata, auth.accountId);
        if (!generalAgreement?.consent) {
          throw new AiForbiddenException(NO_GENERAL_AGREEEMENT_ERROR);
        }

        const history = await this.aiMessageRepository.list(sessionMetadata, null, auth.accountId);
        const conversationId = AiMessageService.getConversationId(history);

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

        socket = await this.aiMessageProvider.getSocket(auth);

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
            AiMessageService.prepareHistory(history),
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
