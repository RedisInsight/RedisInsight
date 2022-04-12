import IORedis from 'ioredis';

export interface IOnDatePayload {
  time: string;
  args: string[];
  source: string;
  database: number;
  shardOptions: IORedis.RedisOptions
}

export interface IClientMonitorObserver {
  id: string;
  handleOnData: (data: IOnDatePayload) => void;
  handleOnDisconnect: () => void;
  destroy: () => void;
}
