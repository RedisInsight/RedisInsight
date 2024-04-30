import { Socket } from 'socket.io-client';
import { Injectable, Logger } from '@nestjs/common';
import { ClientContext, SessionMetadata } from 'src/common/models';
import { AiQueryProvider } from 'src/modules/ai/query/providers/ai-query.provider';
import { SendAiQueryMessageDto } from 'src/modules/ai/query/dto/send.ai-query.message.dto';
import { wrapAiQueryError } from 'src/modules/ai/query/exceptions';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import { getFullDbContext, getIndexContext } from 'src/modules/ai/query/utils/context.util';
import { Response } from 'express';
import { AiQueryMessage } from 'src/modules/ai/query/models';
import { AiQueryMessageRepository } from 'src/modules/ai/query/repositories/ai-query.message.repository';
import { AiQueryAuthProvider } from 'src/modules/ai/query/providers/auth/ai-query-auth.provider';
import { classToClass } from 'src/utils';
import { AiQueryMessageType } from 'src/modules/ai/query/entities/ai-query.message.entity';

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
  ) {}

  static prepareHistory(messages: AiQueryMessage[]): string[] {
    return messages.map((message) => message.content);
  }

  async stream(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    dto: SendAiQueryMessageDto,
    res: Response,
  ) {
    let socket: Socket;

    try {
      const auth = await this.aiQueryAuthProvider.getAuthData(sessionMetadata);
      const history = await this.aiQueryMessageRepository.list(sessionMetadata, databaseId, auth.accountId);

      const client = await this.databaseClientFactory.getOrCreateClient({
        sessionMetadata,
        databaseId,
        context: ClientContext.AI,
      });

      const context = await getFullDbContext(client);

      const question = classToClass(AiQueryMessage, {
        type: AiQueryMessageType.HumanMessage,
        content: dto.content,
        databaseId,
        accountId: auth.accountId,
        createdAt: new Date(),
      });

      const answer = classToClass(AiQueryMessage, {
        type: AiQueryMessageType.AiMessage,
        content: '',
        databaseId,
        accountId: auth.accountId,
      });

      socket = await this.aiQueryProvider.getSocket(auth);

      socket.on('chunk', (chunk) => {
        answer.content += chunk;
        res.write(chunk);
      });

      socket.on('get_index_context', async (index, cb) => {
        try {
          const indexContext = await getIndexContext(client, index);
          cb(indexContext);
        } catch (e) {
          this.logger.warn('Unable to create index content', e);
          cb(e.message);
        }
      });

      socket.on('execute_query', async (data, cb) => {
        try {
          if (!COMMANDS_WHITELIST[(data?.[0] || '').toLowerCase()]) {
            return cb('-ERR: This command is not allowed');
          }

          return cb(await client.sendCommand(data, { replyEncoding: 'utf8' }));
        } catch (e) {
          this.logger.warn('Query execution error', e);
          return cb(e.message);
        }
      });

      await socket.emitWithAck('stream', dto.content, context, AiQueryService.prepareHistory(history));
      socket.close();
      await this.aiQueryMessageRepository.createMany(sessionMetadata, [question, answer]);

      return res.end();
    } catch (e) {
      socket?.close?.();
      throw wrapAiQueryError(e, 'Unable to send the question');
    }
  }

  async getHistory(sessionMetadata: SessionMetadata, databaseId: string): Promise<AiQueryMessage[]> {
    try {
      const auth = await this.aiQueryAuthProvider.getAuthData(sessionMetadata);
      return await this.aiQueryMessageRepository.list(sessionMetadata, databaseId, auth.accountId);
    } catch (e) {
      throw wrapAiQueryError(e, 'Unable to get history');
    }
  }

  async clearHistory(sessionMetadata: SessionMetadata, databaseId: string): Promise<void> {
    try {
      const auth = await this.aiQueryAuthProvider.getAuthData(sessionMetadata);
      return this.aiQueryMessageRepository.clearHistory(sessionMetadata, databaseId, auth.accountId);
    } catch (e) {
      throw wrapAiQueryError(e, 'Unable to clear history');
    }
  }
}
