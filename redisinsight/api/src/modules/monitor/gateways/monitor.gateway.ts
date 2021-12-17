import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
  WsResponse,
} from '@nestjs/websockets';
import { AsyncApiPub, AsyncApiService } from 'nestjs-asyncapi';
import { Logger, UseFilters } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { get } from 'lodash';
import { MonitorService } from 'src/modules/monitor/services/monitor-provider/monitor.service';
import { ApiProperty } from '@nestjs/swagger';
import { MonitorWsExceptionFilter } from './monitorWsExceptionFilter';
import { IMonitorObserver } from '../services/monitor-provider/monitor-observer';
import { MonitorGatewayClientEvents, MonitorGatewayServerEvents } from '../constants/gatewayEvents';

class AnySwaggerExampleDto {
  @ApiProperty()
  readonly name: string;
}

@AsyncApiService({ serviceName: 'monitor' })
@UseFilters(new MonitorWsExceptionFilter())
@WebSocketGateway({ path: '/websockets', namespace: 'monitor' })
export class MonitorGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('MonitorGateway');

  constructor(private service: MonitorService) {}

  afterInit(): void {
    this.logger.log('Initialized');
  }

  handleConnection(socketClient: Socket): void {
    // eslint-disable-next-line sonarjs/no-duplicate-string
    const instanceId = get(socketClient, 'handshake.query.instanceId');
    this.logger.log(`Client connected: ${socketClient.id}, instanceId: ${instanceId}`);
  }

  async handleDisconnect(socketClient: Socket): Promise<void> {
    const instanceId = get(socketClient, 'handshake.query.instanceId');
    this.logger.log(`Client disconnected: ${socketClient.id}, instanceId: ${instanceId}`);
  }

  @SubscribeMessage('test')
  @SubscribeMessage('test')
  @AsyncApiPub({
    channel: 'test',
    summary: 'Send test packet',
    description: 'method is used for test purposes',
    message: {
      name: 'test data',
      payload: {
        type: AnySwaggerExampleDto,
      },
    },
  })
  test(@ConnectedSocket() client: Socket, @MessageBody() data: string) {
    this.logger.log(`data from client ${client.id} : ${JSON.stringify(data)}`);
    this.server.emit('test', data);
  }

  @SubscribeMessage(MonitorGatewayClientEvents.MonitorStart)
  async handleStartMonitor(socketClient: Socket): Promise<WsResponse> {
    const instanceId = get(socketClient, 'handshake.query.instanceId');
    try {
      const observer = await this.service.getMonitorObserver(instanceId);
      await this.handleMonitorEvents(socketClient, observer);

      return { event: MonitorGatewayServerEvents.MonitorStarted, data: {} };
    } catch (error) {
      throw new WsException(error);
    }
  }

  private async handleMonitorEvents(socketClient: Socket, monitorObserver: IMonitorObserver) {
    const monitorHandler = (time, args, source, database) => {
      socketClient.emit(MonitorGatewayServerEvents.MonitorEvent, {
        time, args, source, database,
      });
    };
    const errorHandler = () => {
      socketClient.emit(MonitorGatewayServerEvents.MonitorStopped, {});
    };

    await monitorObserver.subscribe(monitorHandler, errorHandler);

    socketClient.on(MonitorGatewayClientEvents.Disconnect, () => {
      monitorObserver.unsubscribe([monitorHandler, errorHandler]);
    });
    socketClient.on(MonitorGatewayClientEvents.MonitorStop, () => {
      monitorObserver.unsubscribe([monitorHandler, errorHandler]);
    });
  }
}
