/* eslint-disable no-param-reassign */
import { INestApplication, Injectable, Logger } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { MessageMappingProperties } from '@nestjs/websockets';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';

@Injectable()
export class SessionMetadataAdapter extends IoAdapter {
  private logger = new Logger('SessionMetadataAdapter');

  constructor(private app: INestApplication) {
    super(app);
  }

  async bindMessageHandlers(
    socket: Socket,
    handlers: MessageMappingProperties[],
    transform: (data: any) => Observable<any>,
  ) {
    // TODO: [USER_CONTEXT]
    // Assuming that we'll figure out session data from a JWT token
    // but that is up to discovery later on
    // eslint-disable-next-line no-param-reassign
    const jwt = socket.handshake.headers.authorization?.split(' ')[1];
    socket.data['jwt'] = jwt || null;

    super.bindMessageHandlers(socket, handlers, transform);
  }
}
