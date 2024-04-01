import { SessionMetadata } from 'src/common/models';
import config, { Config } from 'src/utils/config';
import axios from 'axios';
import { wrapConvAiError } from 'src/modules/ai/chat/exceptions';
import { Stream } from 'typeorm';

const aiConfig = config.get('ai') as Config['ai'];

export class ConvAiProvider {
  protected api = axios.create({
    baseURL: aiConfig.convAiApiUrl,
  });

  async auth(sessionMetadata: SessionMetadata): Promise<string> {
    try {
      const { data } = await this.api.post(
        '/auth',
        {},
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'kb-tokens': aiConfig.convAiToken,
          },
        },
      );

      return data.convai_session_id;
    } catch (e) {
      throw wrapConvAiError(e);
    }
  }

  async getHistory(sessionMetadata: SessionMetadata, chatId: string): Promise<object[]> {
    try {
      const { data } = await this.api.get(
        '/history',
        {
          headers: {
            'session-id': chatId,
          },
        },
      );

      return JSON.parse(data);
    } catch (e) {
      throw wrapConvAiError(e);
    }
  }

  async postMessage(sessionMetadata: SessionMetadata, chatId: string, message: string): Promise<Stream> {
    try {
      const { data } = await this.api.post(
        '/chat',
        {},
        {
          params: {
            q: message,
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'session-id': chatId,
          },
          responseType: 'stream',
        },
      );

      return data;
    } catch (e) {
      throw wrapConvAiError(e);
    }
  }

  async reset(sessionMetadata: SessionMetadata, chatId: string): Promise<void> {
    try {
      await this.api.post(
        '/reset',
        {},
        {
          headers: {
            'session-id': chatId,
          },
        },
      );
    } catch (e) {
      throw wrapConvAiError(e);
    }
  }
}
