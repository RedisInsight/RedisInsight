import { EventEmitter } from 'events';

export type ObserverType = (...args: any[]) => void;
export type EventType = 'monitor' | 'error';

export interface IMonitor extends EventEmitter {
  disconnect(): void;
}

export interface IMonitorObserver {
  status: string;
  subscribe: (observer: ObserverType, onError?: ObserverType) => Promise<void>;
  unsubscribe: (observers: ObserverType[]) => void;
  clearObservers: () => void;
}
