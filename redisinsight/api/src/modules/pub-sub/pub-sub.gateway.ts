import { get } from 'lodash';
import { Socket, Server } from 'socket.io';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import {
  BadRequestException, Body, Logger,
} from '@nestjs/common';
import config from 'src/utils/config';
import { PubSubService } from 'src/modules/pub-sub/pub-sub.service';
import { Client } from 'src/modules/pub-sub/decorators/client.decorator';
import { UserClient } from 'src/modules/pub-sub/model/user-client';
import { SubscribeDto } from 'src/modules/pub-sub/dto';
import { PubSubClientEvents } from './constants';

const SOCKETS_CONFIG = config.get('sockets');

@WebSocketGateway({ namespace: 'pub-sub', cors: SOCKETS_CONFIG.cors, serveClient: SOCKETS_CONFIG.serveClient })
export class PubSubGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() wss: Server;

  private logger: Logger = new Logger('PubSubGateway');

  constructor(private service: PubSubService) {}

  @SubscribeMessage(PubSubClientEvents.Subscribe)
  async subscribe(@Client() client: UserClient, @Body() dto: SubscribeDto): Promise<any> {
    try {
      await this.service.subscribe(client, dto);
      return { status: 'ok' };
    } catch (e) {
      this.logger.error('Unable to subscribe', e);
      return new WsException(new BadRequestException());
    }
  }

  @SubscribeMessage(PubSubClientEvents.Unsubscribe)
  async unsubscribe(@Client() client: UserClient, @Body() dto: SubscribeDto): Promise<any> {
    try {
      await this.service.subscribe(client, dto);
      return { status: 'ok' };
    } catch (e) {
      this.logger.error('Unable to unsubscribe', e);
      throw new WsException(e);
    }
  }

  async handleConnection(client: Socket): Promise<void> {
    const instanceId = PubSubGateway.getInstanceId(client);
    this.logger.log(`Client connected: ${client.id}, instanceId: ${instanceId}`);
  }

  async handleDisconnect(client: Socket): Promise<void> {
    const instanceId = PubSubGateway.getInstanceId(client);
    // await this.service.disconnectListenerFromInstance(instanceId, client.id);
    this.logger.log(`Client disconnected: ${client.id}, instanceId: ${instanceId}`);
  }

  static getInstanceId(client: Socket): string {
    return get(client, 'handshake.query.instanceId');
  }
}
