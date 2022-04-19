import { v4 as uuidv4 } from 'uuid';
import { IClientMonitorObserver } from 'src/modules/profiler/helpers/client-monitor-observer';
import { IMonitorObserver, IShardObserver, MonitorObserverStatus } from 'src/modules/profiler/helpers/monitor-observer';
import { ILogsEmitter } from 'src/modules/profiler/interfaces/logs-emitter.interface';

export const mockClientMonitorObserver: IClientMonitorObserver = {
  id: uuidv4(),
  handleOnData: jest.fn(),
  handleOnDisconnect: jest.fn(),
};

export const mockMonitorObserver: IMonitorObserver = {
  status: MonitorObserverStatus.Wait,
  subscribe: jest.fn(),
  unsubscribe: jest.fn(),
  getSize: jest.fn(),
  clear: jest.fn(),
};

export const mockRedisMonitorObserver: IShardObserver = {
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

export const mockLogEmitter: ILogsEmitter = {
  id: 'test',
  emit: jest.fn(),
  addProfilerClient: jest.fn(),
  removeProfilerClient: jest.fn(),
  flushLogs: jest.fn(),
};
