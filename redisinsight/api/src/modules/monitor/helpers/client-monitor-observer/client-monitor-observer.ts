import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { MonitorGatewayServerEvents } from 'src/modules/monitor/constants/events';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { debounce } from 'lodash';
import { MonitorFilter, userClientFilter } from 'src/modules/monitor/helpers/filters/userClientFilter';
import { commandGroupFilter } from 'src/modules/monitor/helpers/filters/commandGroupFilter';
import { IClientMonitorObserver, IOnDatePayload } from './client-monitor-observer.interface';

class ClientMonitorObserver implements IClientMonitorObserver {
  public readonly id: string;

  private readonly client: Socket;

  private commandsDoc: Record<string, any>;

  private filters: MonitorFilter[];

  private readonly debounce: any;

  private items: any[];

  constructor(id: string, client: Socket, commandsDoc: Record<string, any>) {
    this.id = id;
    this.client = client;
    this.items = [];
    this.commandsDoc = commandsDoc;
    this.filters = [userClientFilter(), commandGroupFilter('generic', commandsDoc)];
    this.debounce = debounce(() => {
      if (this.items.length) {
        this.client.emit(MonitorGatewayServerEvents.Data, this.items);
        this.items = [];
      }
    }, 10, {
      maxWait: 50,
    });
  }

  public async handleOnData(payload: IOnDatePayload) {
    const {
      time, args, source, database,
    } = payload;
    const isMatched = await this.eventIsMatched(payload);
    console.log(222, isMatched)
    if (!isMatched) return;
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

  private async eventIsMatched(data: IOnDatePayload): Promise<boolean> {
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < this.filters.length; i++) {
      const filter = this.filters[i];
      const isMatched = await filter(data);
      if (!isMatched) return false;
    }
    return true;
  }
}
export default ClientMonitorObserver;
