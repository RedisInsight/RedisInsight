import { IFindRedisClientInstanceByOptions } from 'src/modules/core/services/redis/redis.service';
import { GetKeyInfoResponse } from 'src/modules/browser/dto';
import { RedisString } from 'src/common/constants';

export interface IKeyInfoStrategy {
  getInfo(
    clientOptions: IFindRedisClientInstanceByOptions,
    key: RedisString,
    type: string,
  ): Promise<GetKeyInfoResponse>;
}
