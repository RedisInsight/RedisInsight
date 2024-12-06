import { io, Socket } from 'socket.io-client';
import config, { Config } from 'src/utils/config';
import { Injectable } from '@nestjs/common';
import { AiQueryAuthData } from 'src/modules/ai/query/models/ai-query.auth-data';
import { AiQueryWsEvents } from 'src/modules/ai/query/models';
import { wrapAiQueryError } from 'src/modules/ai/query/exceptions';
import { LoggerService } from 'src/modules/logger/logger.service';

const aiConfig = config.get('ai') as Config['ai'];

@Injectable()
export class AiQueryProvider {
  constructor(private logger: LoggerService) {}

  async getSocket(auth: AiQueryAuthData): Promise<Socket> {
    try {
      return await new Promise((resolve, reject) => {
        const socket = io(aiConfig.querySocketUrl, {
          path: aiConfig.querySocketPath,
          reconnection: false,
          transports: ['websocket'],
          extraHeaders: {
            'X-Csrf-Token': auth.csrf,
            Cookie: `JSESSIONID=${auth.sessionId}`,
          },
        });

        socket.on(AiQueryWsEvents.CONNECT_ERROR, (e) => {
          this.logger.error('Unable to establish AI socket connection', e);
          reject(e);
        });

        socket.on(AiQueryWsEvents.CONNECT, async () => {
          this.logger.debug('AI socket connection established');
          resolve(socket);
        });
      });
    } catch (e) {
      throw wrapAiQueryError(e, 'Unable to establish connection');
    }
  }
}
