import { HttpException, Injectable } from '@nestjs/common';
import { ClientContext, SessionMetadata } from 'src/common/models';
import { AiQueryProvider } from 'src/modules/ai/query/providers/ai-query.provider';
import { SendAiQueryMessageDto } from 'src/modules/ai/query/dto/send.ai-query.message.dto';
import { AiQueryInternalServerErrorException } from 'src/modules/ai/query/exceptions';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import { getQueryBuilderContext } from 'src/modules/ai/query/utils/context.util';

@Injectable()
export class AiQueryService {
  constructor(
    private readonly aiQueryProvider: AiQueryProvider,
    private readonly databaseClientFactory: DatabaseClientFactory,
  ) {
  }

  async generateQuery(sessionMetadata: SessionMetadata, dto: SendAiQueryMessageDto) {
    try {
      const client = await this.databaseClientFactory.getOrCreateClient({
        sessionMetadata,
        databaseId: dto.databaseId,
        context: ClientContext.AI,
      });

      // todo: improve if full db context is not enough
      const context = await getQueryBuilderContext(client);

      return await this.aiQueryProvider.generateQuery(sessionMetadata, dto.content, context);
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      }

      throw new AiQueryInternalServerErrorException(e.message);
    }
  }
}
