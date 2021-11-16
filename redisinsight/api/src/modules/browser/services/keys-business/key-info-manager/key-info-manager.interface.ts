import { IFindRedisClientInstanceByOptions } from 'src/modules/core/services/redis/redis.service';
import { GetKeyInfoResponse } from 'src/modules/browser/dto';

export interface IKeyInfoStrategy {
  getInfo(
    clientOptions: IFindRedisClientInstanceByOptions,
    key: string,
    type: string,
  ): Promise<GetKeyInfoResponse>;
}
