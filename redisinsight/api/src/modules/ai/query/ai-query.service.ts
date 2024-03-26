import { HttpException, Injectable } from '@nestjs/common';
import { ClientContext, SessionMetadata } from 'src/common/models';
import { AiQueryProvider } from 'src/modules/ai/query/providers/ai-query.provider';
import { SendAiQueryMessageDto } from 'src/modules/ai/query/dto/send.ai-query.message.dto';
import { AiQueryInternalServerErrorException } from 'src/modules/ai/query/exceptions';
import { AiContextProvider } from 'src/modules/ai/query/providers/ai-context.provider';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';

@Injectable()
export class AiQueryService {
  constructor(
    private readonly aiQueryProvider: AiQueryProvider,
    private readonly contextProvider: AiContextProvider,
    private readonly databaseClientFactory: DatabaseClientFactory,
  ) {
  }

  async getContext(sessionMetadata: SessionMetadata, dto: SendAiQueryMessageDto) {
    try {
      const client = await this.databaseClientFactory.getOrCreateClient({
        sessionMetadata,
        databaseId: dto.databaseId,
        context: ClientContext.AI,
      });

      return await this.contextProvider.getDbContext(client, { topValues: true });
    } catch (e) {
      return {};
    }
  }

  async generateQuery(sessionMetadata: SessionMetadata, dto: SendAiQueryMessageDto) {
    try {
      const context = await this.getContext(sessionMetadata, dto);

      return await this.aiQueryProvider.generateQuery(sessionMetadata, dto.content, context);
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      }

      throw new AiQueryInternalServerErrorException(e.message);
    }
  }
}
