import { Server } from 'socket.io';
import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import config from 'src/utils/config';
import { OnEvent } from '@nestjs/event-emitter';
import { RecommendationServerEvents } from 'src/modules/database-recommendation/constants';
import {
  DatabaseRecommendationsResponse,
} from 'src/modules/database-recommendation/dto/database-recommendations.response';

const SOCKETS_CONFIG = config.get('sockets');

@WebSocketGateway({ cors: SOCKETS_CONFIG.cors, serveClient: SOCKETS_CONFIG.serveClient })
export class DatabaseRecommendationGateway {
  @WebSocketServer() wss: Server;

  @OnEvent(RecommendationServerEvents.Recommendation)
  notify(databaseId: string, data: DatabaseRecommendationsResponse) {
    this.wss.of('/').emit(
      `${RecommendationServerEvents.Recommendation}:${databaseId}`,
      data,
    );
  }
}
