import { isArray } from 'lodash';
import { v4 as uuidV4 } from 'uuid';
import { Socket } from 'socket.io-client';
import { Injectable, Logger } from '@nestjs/common';
import { SessionMetadata } from 'src/common/models';
import { Response } from 'express';
import { classToClass, Config } from 'src/utils';
import { plainToInstance } from 'class-transformer';
import config from 'src/utils/config';
import { AiRdiProvider } from 'src/modules/ai/rdi/providers/ai-rdi.provider';
import { AiRdiMessageRepository } from 'src/modules/ai/rdi/repositories/ai-rdi.message.repository';
import { AiRdiContextRepository } from 'src/modules/ai/rdi/repositories/ai-rdi.context.repository';
import {
  AiRdiIntermediateStep,
  AiRdiIntermediateStepType,
  AiRdiMessage,
  AiRdiMessageRole,
  AiRdiMessageType,
  AiRdiWsEvents,
  RdiSocketEvents,
} from 'src/modules/ai/rdi/models';
import { SendAiRdiMessageDto } from 'src/modules/ai/rdi/dto/send.ai-rdi.message.dto';
import { wrapAiRdiError } from 'src/modules/ai/rdi/exceptions';

const aiConfig = config.get('ai') as Config['ai'];

@Injectable()
export class AiRdiService {
  private readonly logger = new Logger('AiRdiService');

  constructor(
    private readonly aiRdiProvider: AiRdiProvider,
    private readonly aiRdiMessageRepository: AiRdiMessageRepository,
    private readonly aiRdiContextRepository: AiRdiContextRepository,
  ) {}

  static prepareHistoryIntermediateSteps(
    message: AiRdiMessage,
  ): [AiRdiMessageRole, string][] {
    const steps = [];
    message.steps.forEach((step) => {
      switch (step.type) {
        case AiRdiIntermediateStepType.TOOL:
          steps.push([AiRdiMessageRole.TOOL, step.data]);
          break;
        case AiRdiIntermediateStepType.TOOL_CALL:
          steps.push([AiRdiMessageRole.TOOL_CALL, step.data]);
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
          AiRdiService.limitExtendedReply(
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

  static prepareHistory(messages: AiRdiMessage[]): string[][] {
    const history = [];
    messages.forEach((message) => {
      if (message.type === RdiSocketEvents.RdiReply) {
        history.push([AiRdiMessageRole.RDI, message.content]);
        if (message.steps.length) {
          history.push(
            ...AiRdiService.prepareHistoryIntermediateSteps(message),
          );
        }
      } else {
        // ignore for now
      }
    });

    return history;
  }

  static getConversationId(messages: AiRdiMessage[]): string {
    return messages?.[messages.length - 1]?.conversationId || uuidV4();
  }

  async stream(
    sessionMetadata: SessionMetadata,
    targetId: string,
    dto: SendAiRdiMessageDto,
    res: Response,
  ) {
    let socket: Socket;

    try {
      const history = await this.aiRdiMessageRepository.list(targetId);
      const conversationId = AiRdiService.getConversationId(history);

      let context = await this.aiRdiContextRepository.getFullContext(
        sessionMetadata,
        targetId,
      );

      if (!context) {
        // TODO - 16.07.25 - What would provide context for RDI?
        context = JSON.parse(dto.rdiContext);
      }

      const question = classToClass(AiRdiMessage, {
        type: dto.type,
        content: dto.content,
        targetId,
        conversationId,
        createdAt: new Date(),
      });

      const answer = classToClass(AiRdiMessage, {
        type: AiRdiMessageType.AiMessage,
        content: '',
        targetId,
        conversationId,
      });

      socket = await this.aiRdiProvider.getSocket();

      socket.on(RdiSocketEvents.RdiReply, this.defaultListener(answer, res));

      socket.on(AiRdiWsEvents.RUN_QUERY, async (data, cb) => {
        try {
          // todo: do we run queries here?
          return cb();
        } catch (e) {
          this.logger.warn('Extended execution error', e, sessionMetadata);
          return cb(e.message);
        }
      });

      socket.on(AiRdiWsEvents.TOOL_CALL, async (data) => {
        answer.steps.push(
          plainToInstance(AiRdiIntermediateStep, {
            type: AiRdiIntermediateStepType.TOOL_CALL,
            data,
          }),
        );
      });

      socket.on(AiRdiWsEvents.TOOL_REPLY, async (data) => {
        answer.steps.push(
          plainToInstance(AiRdiIntermediateStep, {
            type: AiRdiIntermediateStepType.TOOL,
            data,
          }),
        );
      });

      await new Promise((resolve, reject) => {
        socket.on(AiRdiWsEvents.ERROR, async (error) => {
          reject(error);
        });

        socket
          .emitWithAck(
            dto.type,
            dto.content,
            context,
            AiRdiService.prepareHistory(history),
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
      this.logger.debug('Answer', answer.content);
      socket.close();
      await this.aiRdiMessageRepository.createMany([question, answer]);

      return res.end();
    } catch (e) {
      socket?.close?.();
      throw wrapAiRdiError(e, 'Unable to send the question');
    }
  }

  private defaultListener(answer: AiRdiMessage, res: Response) {
    return (chunk: string) => {
      this.logger.debug(chunk);
      // eslint-disable-next-line no-param-reassign
      answer.content += chunk;
      res.write(chunk);
    };
  }

  async getHistory(
    _sessionMetadata: SessionMetadata,
    targetId: string,
  ): Promise<AiRdiMessage[]> {
    try {
      return await this.aiRdiMessageRepository.list(targetId);
    } catch (e) {
      this.logger.error('Unable to get history', e);
      throw wrapAiRdiError(e, 'Unable to get history');
    }
  }

  async clearHistory(
    sessionMetadata: SessionMetadata,
    targetId: string,
  ): Promise<void> {
    try {
      await this.aiRdiContextRepository.reset(sessionMetadata, targetId);

      return this.aiRdiMessageRepository.clearHistory(targetId);
    } catch (e) {
      throw wrapAiRdiError(e, 'Unable to clear history');
    }
  }
}
