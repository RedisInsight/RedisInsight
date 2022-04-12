export enum ProfilerClientEvents {
  Monitor = 'monitor',
  Pause = 'pause',
  FlushLogs = 'flushLogs',
}

export enum ProfilerServerEvents {
  Data = 'monitorData',
  Exception = 'exception',
}

export enum RedisObserverStatus {
  Wait = 'wait',
  Ready = 'ready',
  End = 'end',
  Error = 'error',
}
