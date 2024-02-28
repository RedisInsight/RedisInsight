import { SessionMetadata } from 'src/common/models';
import config, { Config } from 'src/utils/config';
import axios from 'axios';
import { wrapAiQueryError } from 'src/modules/ai/query/exceptions';
import { Logger } from '@nestjs/common';

const aiConfig = config.get('ai') as Config['ai'];

export class AiQueryProvider {
  private readonly logger = new Logger('AiQueryProvider');

  protected api = axios.create({
    baseURL: aiConfig.queryApiUrl,
  });

  async generateQuery(sessionMetadata: SessionMetadata, question: string, context: object): Promise<object> {
    try {
      const { data } = await this.api.post(
        '/generate_query',
        {
          question,
          context,
        },
        {
          auth: {
            username: aiConfig.queryApiUser,
            password: aiConfig.queryApiPass,
          },
        },
      );

      if (data.error) {
        this.logger.error(data.error, data);
        return Promise.reject(new Error('AI return an error'));
      }

      return data;
    } catch (e) {
      throw wrapAiQueryError(e);
    }
  }
}
