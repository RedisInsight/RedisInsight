import { Server } from 'socket.io';
import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import config, { Config } from 'src/utils/config';
import { OnEvent } from '@nestjs/event-emitter';
import { RecommendationServerEvents } from 'src/modules/database-recommendation/constants';
import {
  DatabaseRecommendationsResponse,
} from 'src/modules/database-recommendation/dto/database-recommendations.response';
import { Logger } from '@nestjs/common';
import { SessionMetadata } from 'src/common/models';

const SOCKETS_CONFIG = config.get('sockets') as Config['sockets'];

@WebSocketGateway({
  namespace: 'instance',
  path: SOCKETS_CONFIG.path,
  cors: SOCKETS_CONFIG.cors.enabled
    ? { origin: SOCKETS_CONFIG.cors.origin, credentials: SOCKETS_CONFIG.cors.credentials } : false,
  serveClient: SOCKETS_CONFIG.serveClient,
})
export class DatabaseGateway {
  private readonly logger = new Logger(DatabaseGateway.name);

  @WebSocketServer() wss: Server;

  static getRoomName(userId: string, databaseId: string) {
    return `user:${userId}:db:${databaseId}`;
  }

  @OnEvent(RecommendationServerEvents.Recommendation)
  notify(databaseId: string, sessionMetadata: SessionMetadata, data: DatabaseRecommendationsResponse) {
    const roomName = DatabaseGateway.getRoomName(sessionMetadata.userId, databaseId);
    this.logger.debug('Send recommendation to websocket room', { roomName });
    this.wss.to(roomName).emit(
      RecommendationServerEvents.Recommendation,
      data,
    );
  }
}
