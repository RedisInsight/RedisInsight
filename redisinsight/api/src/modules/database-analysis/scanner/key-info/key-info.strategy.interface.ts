import { RedisString } from 'src/common/constants';
import { Redis } from 'ioredis';

export interface IKeyInfoStrategy {
  getLength(client: Redis, key: RedisString): Promise<number>
  getLengthSafe(client: Redis, key: RedisString): Promise<number>
}
