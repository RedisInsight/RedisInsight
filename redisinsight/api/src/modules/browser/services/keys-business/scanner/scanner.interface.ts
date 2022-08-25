import { RedisDataType } from 'src/modules/browser/dto';
import { IFindRedisClientInstanceByOptions } from 'src/modules/core/services/redis/redis.service';
import { Redis } from 'ioredis';

interface IGetKeysArgs {
  cursor: string;
  count?: number;
  match?: string;
  type?: RedisDataType;
}

export interface IGetNodeKeysResult {
  total: number;
  scanned: number;
  cursor: number;
  keys: any[];
  node?: Redis,
  host?: string;
  port?: number;
}

export interface IScannerStrategy {
  getKeys(
    clientOptions: IFindRedisClientInstanceByOptions,
    args: IGetKeysArgs,
  ): Promise<IGetNodeKeysResult[]>;
}
