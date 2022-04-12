import { WsException } from '@nestjs/websockets';
import * as MockedSocket from 'socket.io-mock';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { MonitorGatewayServerEvents } from 'src/modules/profiler/constants/events';
import { ProfilerClient } from './profiler.client';
import { IOnDatePayload } from '../interfaces/client-monitor-observer.interface';

describe('ClientMonitorObserver', () => {
  let socketClient;

  beforeEach(() => {
    socketClient = new MockedSocket();
    socketClient.id = '123';
    socketClient.emit = jest.fn();
  });

  it.only('should be defined', () => {
    const client = new ProfilerClient(socketClient.id, socketClient);

    expect(client.id).toEqual(socketClient.id);
  });
  it.only('should emit event on monitorData', async () => {
    const client = new ProfilerClient(socketClient.id, socketClient);
    const monitorData = {
      // unix timestamp
      time: `${(new Date()).getTime() / 1000}`,
      source: '127.0.0.1:58612',
      database: 0,
      args: ['set', 'foo', 'bar'],
    };
    const payload: IOnDatePayload = { ...monitorData, shardOptions: { host: '127.0.0.1', port: 6379 } };

    client.handleOnData(payload);

    await new Promise((r) => setTimeout(r, 500));

    expect(socketClient.emit).toHaveBeenCalledWith(MonitorGatewayServerEvents.Data, [monitorData]);
  });
  it.only('should emit exception event', () => {
    const client = new ProfilerClient(socketClient.id, socketClient);

    client.handleOnDisconnect();

    expect(socketClient.emit).toHaveBeenCalledWith(
      MonitorGatewayServerEvents.Exception,
      new WsException(ERROR_MESSAGES.NO_CONNECTION_TO_REDIS_DB),
    );
  });
});
