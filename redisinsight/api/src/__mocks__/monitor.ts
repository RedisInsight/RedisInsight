import { v4 as uuidv4 } from 'uuid';
import { IClientMonitorObserver } from 'src/modules/monitor/helpers/client-monitor-observer';
import { IMonitorObserver, IShardObserver, MonitorObserverStatus } from 'src/modules/monitor/helpers/monitor-observer';

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
