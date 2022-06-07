import { Socket, Server } from 'socket.io';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import {
  Body, Logger, UseFilters, UsePipes, ValidationPipe,
} from '@nestjs/common';
import config from 'src/utils/config';
import { PubSubService } from 'src/modules/pub-sub/pub-sub.service';
import { Client } from 'src/modules/pub-sub/decorators/client.decorator';
import { UserClient } from 'src/modules/pub-sub/model/user-client';
import { SubscribeDto } from 'src/modules/pub-sub/dto';
import { AckWsExceptionFilter } from 'src/modules/pub-sub/filters/ack-ws-exception.filter';
import { PubSubClientEvents } from './constants';

const SOCKETS_CONFIG = config.get('sockets');

@UsePipes(new ValidationPipe())
@UseFilters(AckWsExceptionFilter)
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
      throw e;
    }
  }

  @SubscribeMessage(PubSubClientEvents.Unsubscribe)
  async unsubscribe(@Client() client: UserClient, @Body() dto: SubscribeDto): Promise<any> {
    try {
      await this.service.unsubscribe(client, dto);
      return { status: 'ok' };
    } catch (e) {
      this.logger.error('Unable to unsubscribe', e);
      throw e;
    }
  }

  async handleConnection(client: Socket): Promise<void> {
    this.logger.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket): Promise<void> {
    await this.service.handleDisconnect(client.id);
    this.logger.log(`Client disconnected: ${client.id}`);
  }
}
