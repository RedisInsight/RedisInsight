import { io, Socket } from 'socket.io-client';
import config, { Config } from 'src/utils/config';
import { Injectable, Logger } from '@nestjs/common';
import { AiAuthData } from 'src/modules/ai/models/ai.auth-data';
import { AiWsEvents } from 'src/modules/ai/models';
import { wrapAiError } from 'src/modules/ai/exceptions';

const aiConfig = config.get('ai') as Config['ai'];

@Injectable()
export class AiProvider {
  private readonly logger = new Logger('AiProvider');

  async getSocket(auth: AiAuthData): Promise<Socket> {
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

        socket.on(AiWsEvents.CONNECT_ERROR, (e) => {
          this.logger.error('Unable to establish AI socket connection', e);
          reject(e);
        });

        socket.on(AiWsEvents.CONNECT, async () => {
          this.logger.debug('AI socket connection established');
          resolve(socket);
        });
      });
    } catch (e) {
      throw wrapAiError(e, 'Unable to establish connection');
    }
  }
}
