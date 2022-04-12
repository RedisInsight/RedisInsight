import { Socket } from 'socket.io';
import { MonitorGatewayServerEvents } from 'src/modules/monitor/constants/events';
import { WsException } from '@nestjs/websockets';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { debounce } from 'lodash';
import { ILogsEmitter } from 'src/modules/monitor/helpers/emitters/logs-emitter.interface';
import { IClientMonitorObserver, IOnDatePayload } from './client-monitor-observer.interface';

class ClientMonitorObserver implements IClientMonitorObserver {
  public readonly id: string;

  private readonly client: Socket;

  private logsEmitters: Map<string, ILogsEmitter> = new Map();

  private filters: any[];

  private readonly debounce: any;

  private items: any[];

  constructor(id: string, client: Socket) {
    this.id = id;
    this.client = client;
    this.items = [];
    this.debounce = debounce(() => {
      if (this.items.length) {
        this.logsEmitters.forEach((emitter) => {
          emitter.emit(this.items);
        });
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

  public addLogsEmitter(emitter: ILogsEmitter) {
    this.logsEmitters.set(emitter.id, emitter);
    emitter.addClientObserver(this.id);
  }

  public destroy() {
    this.logsEmitters.forEach((emitter) => emitter.removeClientObserver(this.id));
  }
}
export default ClientMonitorObserver;
