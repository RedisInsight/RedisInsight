import { Injectable } from '@nestjs/common';
import { ClientContext, SessionMetadata } from 'src/common/models';
import { ConvAiProvider } from 'src/modules/ai/chat/providers/conv-ai.provider';
import { plainToClass } from 'class-transformer';
import { AiChat } from 'src/modules/ai/chat/models';
import { SendAiChatMessageDto } from 'src/modules/ai/chat/dto/send.ai-chat.message.dto';
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

      const indexes = await client.call('ft._list');
      console.log('___ indexes', indexes);

      if (!indexes?.length) {
        return context;
      }

      const attributes = await Promise.all(indexes.map(async (index) => {
        const attrResponse = convertStringsArrayToObject(await client.call('ft.info', index));
        console.log('___ attrResponse', attrResponse)

        context[index] = attrResponse?.attributes.map((attrs) => convertStringsArrayToObject(attrs));
      }))

      console.log('___ context', require('util').inspect(context, {depth: null}))
      return context;
    } catch (e) {
      throw e;
    }
  }

  async generateQuery(sessionMetadata: SessionMetadata, dto: SendAiQueryMessageDto) {
    try {
      // dto.databaseId = '03762280-b1d2-462e-8074-4f97ffdd7aaa'
      console.log('___ dto', dto)
      const context = await this.getContext(sessionMetadata, dto);

      console.log('___ context', context)
      const aiResponse = await this.aiQueryProvider.generateQuery(sessionMetadata, dto.content, context);

      console.log('___ aiResponse', aiResponse)
      let response = 'response';

      return aiResponse;
    } catch (e) {
      throw e;
    }
  }
}
