/* eslint-disable no-param-reassign */
import { Injectable, Logger } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { MessageMappingProperties } from '@nestjs/websockets';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';
import { get } from 'lodash';
import { DEFAULT_SESSION_ID, DEFAULT_USER_ID } from 'src/common/constants';
import { SessionMetadata } from 'src/common/models';
import { DatabaseGateway } from 'src/modules/database/database.gateway';

@Injectable()
export class SessionMetadataAdapter extends IoAdapter {
  private logger = new Logger('SessionMetadataAdapter');

  async bindMessageHandlers(
    socket: Socket,
    handlers: MessageMappingProperties[],
    transform: (data: any) => Observable<any>,
  ) {
    const sessionMetadata: SessionMetadata = {
      userId: DEFAULT_USER_ID,
      sessionId: DEFAULT_SESSION_ID,
    };

    socket.data['sessionMetadata'] = sessionMetadata;

    // join room for database instance if instanceId is provided
    const instanceId = get(socket, 'handshake.query.instanceId') as string;
    if (instanceId) {
      const roomName = DatabaseGateway.getRoomName(sessionMetadata.userId, instanceId);
      this.logger.debug('Auto-joining websocket room for DB', { roomName });
      socket.join(roomName);
    }

    super.bindMessageHandlers(socket, handlers, transform);
  }
}
