import { Socket } from 'socket.io';
import { SessionMetadata } from 'src/common/models';
import { DatabaseRecommendationsSubscribeDto } from './dto/recommendation-subscribe.dto';

export abstract class DatabaseRecommendationGateway {
  getRoomName(instanceId: string) {
    return `db-recommendations:${instanceId}`;
  }

  abstract subscribeForInstance(
    sessionMetadata: SessionMetadata,
    socket: Socket,
    dto: DatabaseRecommendationsSubscribeDto
  );
}
