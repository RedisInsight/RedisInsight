import { SessionMetadata } from 'src/common/models';
import config, { Config } from 'src/utils/config';
import axios from 'axios';
import { wrapAiQueryError } from 'src/modules/ai/query/exceptions';

const aiConfig = config.get('ai') as Config['ai'];

export class AiQueryProvider {
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

      return data;
    } catch (e) {
      console.log('___ e', e.response.data)
      throw wrapAiQueryError(e);
    }
  }
}
