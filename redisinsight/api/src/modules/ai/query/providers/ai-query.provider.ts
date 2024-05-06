import { io, Socket } from 'socket.io-client';
import config, { Config } from 'src/utils/config';
import { Injectable, Logger } from '@nestjs/common';
import { AiQueryAuthData } from 'src/modules/ai/query/models/ai-query.auth-data';
import { AiQueryWsEvents } from 'src/modules/ai/query/models';

const aiConfig = config.get('ai') as Config['ai'];

@Injectable()
export class AiQueryProvider {
  private readonly logger = new Logger('AiQueryProvider');

  async getSocket(auth: AiQueryAuthData): Promise<Socket> {
    return new Promise((resolve, reject) => {
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
  }
}
