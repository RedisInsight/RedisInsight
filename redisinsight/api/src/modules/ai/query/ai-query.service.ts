import { HttpException, Injectable } from '@nestjs/common';
import { ClientContext, SessionMetadata } from 'src/common/models';
import { AiQueryProvider } from 'src/modules/ai/query/providers/ai-query.provider';
import { SendAiQueryMessageDto } from 'src/modules/ai/query/dto/send.ai-query.message.dto';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import { getFullDbContext } from 'src/modules/ai/query/utils/context.util';
import { AiQueryInternalServerErrorException } from 'src/modules/ai/query/exceptions';

@Injectable()
export class AiQueryService {
  constructor(
    private readonly aiQueryProvider: AiQueryProvider,
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

      return await getFullDbContext(client);
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
