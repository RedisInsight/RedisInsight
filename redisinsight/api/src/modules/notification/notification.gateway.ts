import { Socket, Server } from 'socket.io';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import {
  Logger,
} from '@nestjs/common';
import config from 'src/utils/config';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationServerEvents } from 'src/modules/notification/constants';
import { NotificationsDto } from 'src/modules/notification/dto';
import { GlobalNotificationProvider } from 'src/modules/notification/providers/global-notification.provider';

const SOCKETS_CONFIG = config.get('sockets');

@WebSocketGateway({ path: SOCKETS_CONFIG.path, cors: SOCKETS_CONFIG.cors, serveClient: SOCKETS_CONFIG.serveClient })
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() wss: Server;

  private logger: Logger = new Logger('NotificationGateway');

  constructor(
    private globalNotificationsProvider: GlobalNotificationProvider,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    this.logger.log(`Client connected: ${client.id}`);
    this.globalNotificationsProvider.init();
  }

  async handleDisconnect(client: Socket): Promise<void> {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @OnEvent(NotificationServerEvents.Notification)
  notification(data: NotificationsDto) {
    this.wss.of('/').emit(NotificationServerEvents.Notification, data);
  }
}
