import { Server, Socket } from 'socket.io';
import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import config, { Config } from 'src/utils/config';
import { OnEvent } from '@nestjs/event-emitter';
import { RecommendationServerEvents } from 'src/modules/database-recommendation/constants';
import {
  DatabaseRecommendationsResponse,
} from 'src/modules/database-recommendation/dto/database-recommendations.response';
import { WSSessionMetadata } from 'src/modules/auth/session-metadata/decorators/ws-session-metadata.decorator';
import { SessionMetadata } from 'src/common/models';
import { Body } from '@nestjs/common';
import { DatabaseRecommendationsSubscribeDto } from 'src/modules/database-recommendation/dto/recommendation-subscribe.dto';
import { DatabaseRecommendationGateway } from 'src/modules/database-recommendation/database-recommendation.gateway';

const SOCKETS_CONFIG = config.get('sockets') as Config['sockets'];

@WebSocketGateway({
  path: SOCKETS_CONFIG.path,
  cors: SOCKETS_CONFIG.cors.enabled
  ? { origin: SOCKETS_CONFIG.cors.origin, credentials: SOCKETS_CONFIG.cors.credentials } : false,
  serveClient: SOCKETS_CONFIG.serveClient,
  })
export class LocalDatabaseRecommendationGateway extends DatabaseRecommendationGateway {
  @WebSocketServer() wss: Server;

  @SubscribeMessage('recommendation:subscribe')
  subscribeForInstance(
    @WSSessionMetadata() sessionMetadata: SessionMetadata,
    @ConnectedSocket() socket: Socket,
    @Body() dto: DatabaseRecommendationsSubscribeDto,
  ) {
    socket.join(this.getRoomName(dto.instanceId));
  }

  @OnEvent(RecommendationServerEvents.Recommendation)
  notify(databaseId: string, data: DatabaseRecommendationsResponse) {
    this.wss.to(this.getRoomName(databaseId)).emit(
      `${RecommendationServerEvents.Recommendation}:${databaseId}`,
      data,
    );
  }
}
