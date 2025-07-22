import { isArray } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { Socket } from 'socket.io-client';
import { Injectable, Logger } from '@nestjs/common';
import { ClientContext, SessionMetadata } from 'src/common/models';
import { AiQueryProvider } from 'src/modules/ai/query/providers/ai-query.provider';
import { SendAiQueryMessageDto } from 'src/modules/ai/query/dto/send.ai-query.message.dto';
import { wrapAiQueryError } from 'src/modules/ai/query/exceptions';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import {
  getFullDbContext,
  getIndexContext,
} from 'src/modules/ai/query/utils/context.util';
import { Response } from 'express';
import {
  AiQueryMessage,
  AiQueryMessageType,
  AiQueryMessageRole,
  AiQueryWsEvents,
  AiQueryIntermediateStepType,
  AiQueryIntermediateStep,
} from 'src/modules/ai/query/models';
import { AiQueryMessageRepository } from 'src/modules/ai/query/repositories/ai-query.message.repository';
import { AiQueryAuthProvider } from 'src/modules/ai/query/providers/auth/ai-query-auth.provider';
import { classToClass, Config } from 'src/utils';
import { plainToInstance } from 'class-transformer';
import { AiQueryContextRepository } from 'src/modules/ai/query/repositories/ai-query.context.repository';
import config from 'src/utils/config';
import * as fs from 'fs';
import * as path from 'path';

const aiConfig = config.get('ai') as Config['ai'];

const COMMANDS_WHITELIST = {
  'ft.search': true,
  'ft.aggregate': true,
};

@Injectable()
export class AiQueryService {
  private readonly logger = new Logger('AiQueryService');

  constructor(
    private readonly aiQueryProvider: AiQueryProvider,
    private readonly databaseClientFactory: DatabaseClientFactory,
    private readonly aiQueryMessageRepository: AiQueryMessageRepository,
    private readonly aiQueryAuthProvider: AiQueryAuthProvider,
    private readonly aiQueryContextRepository: AiQueryContextRepository,
  ) {}

  static prepareHistoryIntermediateSteps(
    message: AiQueryMessage,
  ): [AiQueryMessageRole, string][] {
    const steps = [];
    message.steps.forEach((step) => {
      switch (step.type) {
        case AiQueryIntermediateStepType.TOOL:
          steps.push([AiQueryMessageRole.TOOL, step.data]);
          break;
        case AiQueryIntermediateStepType.TOOL_CALL:
          steps.push([AiQueryMessageRole.TOOL_CALL, step.data]);
          break;
        default:
        // ignore
      }
    });

    return steps;
  }

  static limitQueryReply(reply: any, maxResults = aiConfig.queryMaxResults) {
    let results = reply;
    if (isArray(reply)) {
      results = reply.slice(0, maxResults);
      results = results.map((nested) => {
        if (Array.isArray(nested)) {
          AiQueryService.limitQueryReply(
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

  static prepareHistory(messages: AiQueryMessage[]): string[][] {
    const history = [];
    messages.forEach((message) => {
      switch (message.type) {
        case AiQueryMessageType.AiMessage:
          history.push([AiQueryMessageRole.AI, message.content]);
          if (message.steps.length) {
            history.push(
              ...AiQueryService.prepareHistoryIntermediateSteps(message),
            );
          }
          break;
        case AiQueryMessageType.HumanMessage:
          history.push([AiQueryMessageRole.HUMAN, message.content]);
          break;
        default:
        // ignore
      }
    });

    return history;
  }

  static getConversationId(messages: AiQueryMessage[]): string {
    return messages?.[messages.length - 1]?.conversationId || uuidv4();
  }

  async stream(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    dto: SendAiQueryMessageDto,
    res: Response,
  ) {
    const chunkLength = 100;
    const filePath = path.resolve(__dirname, 'res.txt');

    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const chunks = [];

      // Split content into chunks
      for (let i = 0; i < fileContent.length; i += chunkLength) {
        chunks.push(fileContent.slice(i, i + chunkLength));
      }

      // Send chunks with random intervals
      let chunkIndex = 0;
      const sendNextChunk = () => {
        if (chunkIndex < chunks.length) {
          res.write(chunks[chunkIndex]);
          chunkIndex += 1;

          // Random interval between 50 and 500ms
          const randomInterval = Math.floor(Math.random() * 451) + 50; // 50 to 500ms
          setTimeout(sendNextChunk, randomInterval);
        } else {
          res.end();
        }
      };

      // Start sending chunks
      sendNextChunk();

      // Keep the response open until all chunks are sent
      return new Promise<void>((resolve) => {
        res.on('close', resolve);
      });
    } catch (error) {
      this.logger.error('Error reading file or sending chunks', error);
      return res.status(500).send('Error processing request');
    }
  }

  async getHistory(
    sessionMetadata: SessionMetadata,
    databaseId: string,
  ): Promise<AiQueryMessage[]> {
    return this.aiQueryAuthProvider.callWithAuthRetry(
      sessionMetadata,
      async () => {
        try {
          const auth =
            await this.aiQueryAuthProvider.getAuthData(sessionMetadata);
          return await this.aiQueryMessageRepository.list(
            sessionMetadata,
            databaseId,
            auth.accountId,
          );
        } catch (e) {
          throw wrapAiQueryError(e, 'Unable to get history');
        }
      },
    );
  }

  async clearHistory(
    sessionMetadata: SessionMetadata,
    databaseId: string,
  ): Promise<void> {
    return this.aiQueryAuthProvider.callWithAuthRetry(
      sessionMetadata,
      async () => {
        try {
          const auth =
            await this.aiQueryAuthProvider.getAuthData(sessionMetadata);

          await this.aiQueryContextRepository.reset(
            sessionMetadata,
            databaseId,
            auth.accountId,
          );

          return this.aiQueryMessageRepository.clearHistory(
            sessionMetadata,
            databaseId,
            auth.accountId,
          );
        } catch (e) {
          throw wrapAiQueryError(e, 'Unable to clear history');
        }
      },
    );
  }
}
