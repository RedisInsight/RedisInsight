import { ILogsEmitter } from 'src/modules/profiler/interfaces/logs-emitter.interface';
import { ProfilerClient } from 'src/modules/profiler/models/profiler.client';
import { RedisObserver } from 'src/modules/profiler/models/redis.observer';
import { IShardObserver } from 'src/modules/profiler/interfaces/shard-observer.interface';
import { LogFile } from 'src/modules/profiler/models/log-file';
import { ProfilerAnalyticsService } from 'src/modules/profiler/profiler-analytics.service';
import { MockType } from 'src/__mocks__/common';
import { TelemetryEvents } from 'src/constants';
import * as MockedSocket from 'socket.io-mock';
import { IMonitorData } from 'src/modules/profiler/interfaces/monitor-data.interface';

export const mockMonitorDataItemEmitted = {
  time: '14239988881.12341',
  source: '127.0.0.1',
  database: 0,
  args: ['set', 'foo', 'bar'],
};

export const mockMonitorDataItem: IMonitorData = {
  ...mockMonitorDataItemEmitted,
  shardOptions: null,
};

export const mockSocket = new MockedSocket();
mockSocket['emit'] = jest.fn();
//
// export const mockProfilerClient: MockType<ProfilerClient> = {
//   id: uuidv4(),
//   handleOnData: jest.fn(),
//   handleOnDisconnect: jest.fn(),
//   addLogsEmitter: jest.fn(),
//   flushLogs: jest.fn(),
//   destroy: jest.fn(),
// };

export const mockRedisObserver: Partial<RedisObserver> = {
  // status: RedisObserverStatus.Wait,
  init: jest.fn(),
  subscribe: jest.fn(),
  unsubscribe: jest.fn(),
  getProfilerClientsSize: jest.fn(),
  clear: jest.fn(),
  removeShardsListeners: jest.fn(),
};

export const mockRedisShardObserver: IShardObserver = {
  addListener: jest.fn(),
  eventNames: jest.fn(),
  getMaxListeners: jest.fn(),
  listenerCount: jest.fn(),
  listeners: jest.fn(),
  prependListener: jest.fn(),
  prependOnceListener: jest.fn(),
  removeAllListeners: jest.fn(),
  removeListener: jest.fn(),
  rawListeners: jest.fn(),
  setMaxListeners: jest.fn(),
  on: jest.fn(),
  emit: jest.fn(),
  off: jest.fn(),
  once: jest.fn(),
  disconnect: jest.fn(),
};

export const mockProfilerAnalyticsEvents = new Map();
mockProfilerAnalyticsEvents.set(TelemetryEvents.ProfilerLogDownloaded, jest.fn());
mockProfilerAnalyticsEvents.set(TelemetryEvents.ProfilerLogDeleted, jest.fn());

export const mockProfilerAnalyticsService: MockType<ProfilerAnalyticsService> = {
  sendLogDeleted: jest.fn(),
  sendLogDownloaded: jest.fn(),
  getEventsEmitters: jest.fn().mockImplementation(() => mockProfilerAnalyticsEvents),
};

export const mockLogEmitter: ILogsEmitter = {
  id: 'test',
  emit: jest.fn(),
  addProfilerClient: jest.fn(),
  removeProfilerClient: jest.fn(),
  flushLogs: jest.fn(),
};

export const mockWriteStream = {
  write: jest.fn(),
};
export const testLogFileId = 'test-log-file-id';
export const mockLogFile: LogFile = new LogFile('instanceid', testLogFileId, mockProfilerAnalyticsEvents);
mockLogFile['getWriteStream'] = jest.fn();
mockLogFile['addProfilerClient'] = jest.fn();
mockLogFile['removeProfilerClient'] = jest.fn();
mockLogFile['destroy'] = jest.fn();

export const mockProfilerClientId = 'profiler-client-id';
export const mockProfilerClient: ProfilerClient = new ProfilerClient(mockProfilerClientId, mockSocket);
