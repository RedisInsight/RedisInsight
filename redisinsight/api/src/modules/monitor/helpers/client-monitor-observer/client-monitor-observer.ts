import { Socket } from 'socket.io';
import { MonitorGatewayServerEvents } from 'src/modules/monitor/constants/events';
import { WsException } from '@nestjs/websockets';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { IClientMonitorObserver, IOnDatePayload } from './client-monitor-observer.interface';

class ClientMonitorObserver implements IClientMonitorObserver {
  public readonly id: string;

  private readonly client: Socket;

  private filters: any[];

  constructor(id: string, client: Socket) {
    this.id = id;
    this.client = client;
  }

  public handleOnData(payload: IOnDatePayload) {
    const {
      time, args, source, database,
    } = payload;
    this.client.emit(MonitorGatewayServerEvents.Data, {
      time, args, source, database,
    });
  }

  public handleOnDisconnect() {
    this.client.emit(
      MonitorGatewayServerEvents.Exception,
      new WsException(ERROR_MESSAGES.NO_CONNECTION_TO_REDIS_DB),
    );
  }
}
export default ClientMonitorObserver;
