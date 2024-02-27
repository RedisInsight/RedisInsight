import { Injectable } from '@nestjs/common';
import { ClientContext, SessionMetadata } from 'src/common/models';
import { AiQueryProvider } from 'src/modules/ai/query/providers/ai-query.provider';
import { SendAiQueryMessageDto } from 'src/modules/ai/query/dto/send.ai-query.message.dto';
import { DatabaseConnectionService } from 'src/modules/database/database-connection.service';
import { convertStringsArrayToObject } from 'src/utils';

@Injectable()
export class AiQueryService {
  constructor(
    private readonly aiQueryProvider: AiQueryProvider,

    private readonly databaseConnectionService: DatabaseConnectionService,
  ) {
  }

  async getContext(sessionMetadata: SessionMetadata, dto: SendAiQueryMessageDto) {
    try {
      const context = {};
      const client = await this.databaseConnectionService.getOrCreateClient({
        sessionMetadata,
        databaseId: dto.databaseId,
        context: ClientContext.AI,
      });

      const indexes = await client.call('ft._list') as string[];

      if (!indexes?.length) {
        return context;
      }

      await Promise.all(indexes.map(async (index) => {
        const attrResponse = convertStringsArrayToObject(await client.call('ft.info', index));

        context[index] = {
          index_name: index,
          attributes: attrResponse?.attributes.map((attrs) => convertStringsArrayToObject(attrs)),
        };
      }));

      return context;
    } catch (e) {
      throw e;
    }
  }

  async generateQuery(sessionMetadata: SessionMetadata, dto: SendAiQueryMessageDto) {
    try {
      const context = await this.getContext(sessionMetadata, dto);

      const aiResponse = await this.aiQueryProvider.generateQuery(sessionMetadata, dto.content, context);

      return aiResponse;
    } catch (e) {
      throw e;
    }
  }
}
