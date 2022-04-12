import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { get } from 'lodash';
import config from 'src/utils/config';
import { MonitorSettings } from 'src/modules/monitor/models/monitor-settings';
import { MonitorService } from './monitor.service';
import { MonitorGatewayClientEvents } from './constants/events';

const SOCKETS_CONFIG = config.get('sockets');

@WebSocketGateway({ namespace: 'monitor', cors: SOCKETS_CONFIG.cors, serveClient: SOCKETS_CONFIG.serveClient })
export class MonitorGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() wss: Server;

  private logger: Logger = new Logger('MonitorGateway');

  constructor(private service: MonitorService) {}

  afterInit(): void {
    this.logger.log('Initialized');
  }

  async handleConnection(socketClient: Socket): Promise<void> {
    // eslint-disable-next-line sonarjs/no-duplicate-string
    const instanceId = get(socketClient, 'handshake.query.instanceId');
    this.logger.log(`Client connected: ${socketClient.id}, instanceId: ${instanceId}`);
  }

  @SubscribeMessage(MonitorGatewayClientEvents.Monitor)
  async monitor(client: Socket, settings: MonitorSettings = null): Promise<any> {
    try {
      const instanceId = get(client, 'handshake.query.instanceId');
      await this.service.addListenerForInstance(instanceId, client, settings);

      return { status: 'ok' };
    } catch (error) {
      throw new WsException(error);
    }
  }

  @SubscribeMessage(MonitorGatewayClientEvents.Pause)
  async pause(client: Socket): Promise<any> {
    try {
      const instanceId = get(client, 'handshake.query.instanceId');
      await this.service.removeListenerFromInstance(instanceId, client.id);

      return { status: 'ok' };
    } catch (error) {
      throw new WsException(error);
    }
  }

  @SubscribeMessage(MonitorGatewayClientEvents.FlushLogs)
  async flushLogs(client: Socket): Promise<any> {
    try {
      const instanceId = get(client, 'handshake.query.instanceId');
      await this.service.flushLogs(instanceId, client.id);

      return { status: 'ok' };
    } catch (error) {
      throw new WsException(error);
    }
  }

  async handleDisconnect(socketClient: Socket): Promise<void> {
    const instanceId = get(socketClient, 'handshake.query.instanceId');
    this.logger.log(`Client disconnected: ${socketClient.id}, instanceId: ${instanceId}`);
    await this.service.disconnectListenerFromInstance(instanceId, socketClient.id);
  }
}
