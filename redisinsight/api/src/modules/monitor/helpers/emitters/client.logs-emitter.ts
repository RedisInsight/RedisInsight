import { Socket } from 'socket.io';
import { ILogsEmitter } from 'src/modules/monitor/helpers/emitters/logs-emitter.interface';
import { MonitorGatewayServerEvents } from 'src/modules/monitor/constants/events';

class ClientLogsEmitter implements ILogsEmitter {
  private readonly client: Socket;

  public readonly id: string;

  constructor(client: Socket) {
    this.id = client.id;
    this.client = client;
  }

  public async emit(items: any[]) {
    return this.client.emit(MonitorGatewayServerEvents.Data, items);
  }

  public addClientObserver() {}

  public removeClientObserver() {}
}

export default ClientLogsEmitter;
