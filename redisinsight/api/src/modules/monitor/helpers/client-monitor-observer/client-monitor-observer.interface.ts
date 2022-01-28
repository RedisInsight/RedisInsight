import IORedis from 'ioredis';

interface IShardOptions extends IORedis.RedisOptions {
  clientAddress?: string;
}

export interface IOnDatePayload {
  time: string;
  args: string[];
  source: string;
  database: number;
  shardOptions: IShardOptions
  sourceOptions: IShardOptions
}

export interface IClientMonitorObserver {
  id: string;
  handleOnData: (data: IOnDatePayload) => void;
  handleOnDisconnect: () => void;
}
