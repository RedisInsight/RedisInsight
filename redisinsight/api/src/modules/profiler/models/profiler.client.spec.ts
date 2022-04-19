import { ProfilerClient } from 'src/modules/profiler/models/profiler.client';
import {
  mockLogEmitter, mockMonitorDataItem, mockMonitorDataItemEmitted, mockSocket,
} from 'src/__mocks__';
import { ProfilerServerEvents } from 'src/modules/profiler/constants';
import { WsException } from '@nestjs/websockets';
import ERROR_MESSAGES from 'src/constants/error-messages';

describe('ProfilerClient', () => {
  let profilerClient: ProfilerClient;

  beforeEach(() => {
    profilerClient = new ProfilerClient(mockSocket.id, mockSocket);
  });

  it('initialization', () => {
    expect(profilerClient.id).toEqual(mockSocket.id);
    expect(profilerClient['client']).toEqual(mockSocket);
    expect(profilerClient['items']).toEqual([]);
    expect(profilerClient['logsEmitters']).toEqual(new Map());
    expect(profilerClient['debounce']).toBeInstanceOf(Function);
  });

  it('handleOnData', async () => {
    profilerClient.addLogsEmitter(mockLogEmitter);
    profilerClient.handleOnData(mockMonitorDataItem);
    profilerClient.handleOnData(mockMonitorDataItem);
    expect(profilerClient['items'].length).toEqual(2);
    expect(mockLogEmitter.emit).not.toHaveBeenCalled();
    await new Promise((res) => setTimeout(res, 100));
    expect(mockLogEmitter.emit).toHaveBeenCalledWith([mockMonitorDataItemEmitted, mockMonitorDataItemEmitted]);
    expect(profilerClient['items'].length).toEqual(0);
  });

  it('handleOnDisconnect', () => {
    profilerClient.handleOnDisconnect();
    expect(mockSocket.emit).toHaveBeenCalledWith(
      ProfilerServerEvents.Exception,
      new WsException(ERROR_MESSAGES.NO_CONNECTION_TO_REDIS_DB),
    );
  });

  it('addLogsEmitter', () => {
    profilerClient.addLogsEmitter(mockLogEmitter);
    expect(mockLogEmitter.addProfilerClient).toHaveBeenCalledWith(profilerClient.id);
    expect(profilerClient['logsEmitters'].size).toEqual(1);
    profilerClient.addLogsEmitter(mockLogEmitter);
    expect(mockLogEmitter.addProfilerClient).toHaveBeenCalledWith(profilerClient.id);
    expect(profilerClient['logsEmitters'].size).toEqual(1);
  });

  it('flushLogs + destroy', () => {
    profilerClient.addLogsEmitter(mockLogEmitter);
    profilerClient.flushLogs();
    expect(mockLogEmitter.flushLogs).toHaveBeenCalled();
    profilerClient.destroy();
    expect(mockLogEmitter.removeProfilerClient).toHaveBeenCalledWith(profilerClient.id);
  });
});

// import { WsException } from '@nestjs/websockets';
// import * as MockedSocket from 'socket.io-mock';
// import ERROR_MESSAGES from 'src/constants/error-messages';
// import { MonitorGatewayServerEvents } from 'src/modules/profiler/constants/events';
// import { ProfilerClient } from './profiler.client';
// import { IOnDatePayload } from '../interfaces/client-monitor-observer.interface';
//
// describe('ClientMonitorObserver', () => {
//   let socketClient;
//
//   beforeEach(() => {
//     socketClient = new MockedSocket();
//     socketClient.id = '123';
//     socketClient.emit = jest.fn();
//   });
//
//   it.only('should be defined', () => {
//     const client = new ProfilerClient(socketClient.id, socketClient);
//
//     expect(client.id).toEqual(socketClient.id);
//   });
//   it.only('should emit event on monitorData', async () => {
//     const client = new ProfilerClient(socketClient.id, socketClient);
//     const monitorData = {
//       // unix timestamp
//       time: `${(new Date()).getTime() / 1000}`,
//       source: '127.0.0.1:58612',
//       database: 0,
//       args: ['set', 'foo', 'bar'],
//     };
//     const payload: IOnDatePayload = { ...monitorData, shardOptions: { host: '127.0.0.1', port: 6379 } };
//
//     client.handleOnData(payload);
//
//     await new Promise((r) => setTimeout(r, 500));
//
//     expect(socketClient.emit).toHaveBeenCalledWith(MonitorGatewayServerEvents.Data, [monitorData]);
//   });
//   it.only('should emit exception event', () => {
//     const client = new ProfilerClient(socketClient.id, socketClient);
//
//     client.handleOnDisconnect();
//
//     expect(socketClient.emit).toHaveBeenCalledWith(
//       MonitorGatewayServerEvents.Exception,
//       new WsException(ERROR_MESSAGES.NO_CONNECTION_TO_REDIS_DB),
//     );
//   });
// });
