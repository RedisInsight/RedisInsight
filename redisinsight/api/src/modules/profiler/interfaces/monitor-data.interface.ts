import { IRedisClientOptions } from 'src/modules/redis/client';

export interface IMonitorData {
  time: string;
  args: string[];
  source: string;
  database: number;
  shardOptions: IRedisClientOptions
}
