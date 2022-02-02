import { Socket } from 'socket.io';
import { MonitorGatewayServerEvents } from 'src/modules/monitor/constants/events';
import { WsException } from '@nestjs/websockets';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { debounce } from 'lodash';
import { IClientMonitorObserver, IOnDatePayload } from './client-monitor-observer.interface';

class ClientMonitorObserver implements IClientMonitorObserver {
  public readonly id: string;

  private readonly client: Socket;

  private filters: any[];

  private readonly debounce: any;

  private items: any[];

  constructor(id: string, client: Socket) {
    this.id = id;
    this.client = client;
    this.items = [];
    this.debounce = debounce(() => {
      if (this.items.length) {
        this.client.emit(MonitorGatewayServerEvents.Data, this.items);
        this.items = [];
      }
    }, 10, {
      maxWait: 50,
    });
  }

  public handleOnData(payload: IOnDatePayload) {
    const {
      time, args, source, database,
    } = payload;

    this.items.push({
      time, args, source, database,
    });

    this.debounce();
  }

  public handleOnDisconnect() {
    this.client.emit(
      MonitorGatewayServerEvents.Exception,
      new WsException(ERROR_MESSAGES.NO_CONNECTION_TO_REDIS_DB),
    );
  }
}
export default ClientMonitorObserver;
