import { RedisString } from 'src/common/constants';
import { IKeyInfoStrategy } from 'src/modules/database-analysis/scanner/key-info/key-info.strategy.interface';
import { Redis } from 'ioredis';

export abstract class AbstractInfoStrategy implements IKeyInfoStrategy {
  abstract getLength(client: Redis, key: RedisString): Promise<number>;

  async getLengthSafe(client: Redis, key: RedisString): Promise<number> {
    try {
      return await this.getLength(client, key);
    } catch (e) {
      return null;
    }
  }
}
