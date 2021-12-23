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
import { MonitorService } from './monitor.service';
import { MonitorGatewayClientEvents } from './constants/events';
import ClientMonitorObserver from './helpers/client-monitor-observer/client-monitor-observer';

@WebSocketGateway({ namespace: 'monitor' })
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
  async monitor(socketClient: Socket): Promise<any> {
    try {
      const instanceId = get(socketClient, 'handshake.query.instanceId');
      await this.service.addListenerForInstance(
        instanceId,
        new ClientMonitorObserver(socketClient.id, socketClient),
      );
      return { status: 'ok' };
    } catch (error) {
      throw new WsException(error);
    }
  }

  handleDisconnect(socketClient: Socket): void {
    const instanceId = get(socketClient, 'handshake.query.instanceId');
    this.logger.log(`Client disconnected: ${socketClient.id}, instanceId: ${instanceId}`);
    this.service.removeListenerFromInstance(instanceId, socketClient.id);
  }
}
