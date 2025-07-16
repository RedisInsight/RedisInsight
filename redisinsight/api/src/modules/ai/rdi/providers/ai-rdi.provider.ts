import { io, Socket } from 'socket.io-client';
import config, { Config } from 'src/utils/config';
import { Injectable, Logger } from '@nestjs/common';
import { AiQueryWsEvents } from 'src/modules/ai/query/models';
import { wrapAiQueryError } from 'src/modules/ai/query/exceptions';

const { querySocketPath, querySocketUrl } = config.get('ai') as Config['ai'];

@Injectable()
export class AiRdiProvider {
  private readonly logger = new Logger('AiRdiProvider');

  async getSocket(): Promise<Socket> {
    try {
      this.logger.debug('Connecting to AI socket', {
        querySocketUrl,
        querySocketPath,
      });

      return await new Promise((resolve, reject) => {
        const socket = io(querySocketUrl, {
          path: querySocketPath,
          reconnection: false,
          transports: ['websocket'],
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
