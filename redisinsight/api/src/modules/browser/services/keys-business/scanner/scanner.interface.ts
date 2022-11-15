import { GetKeyInfoResponse, RedisDataType } from 'src/modules/browser/dto';
import { IFindRedisClientInstanceByOptions } from 'src/modules/redis/redis.service';
import { Cluster, Redis } from 'ioredis';
import { RedisString } from 'src/common/constants';

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

  getKeysInfo(
    client: Redis | Cluster,
    keys: RedisString[],
    type?: RedisDataType,
  ): Promise<GetKeyInfoResponse[]>;
}
