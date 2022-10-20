import { RedisString } from 'src/common/constants';
import { AbstractInfoStrategy } from 'src/modules/database-analysis/scanner/key-info/strategies/abstract.info.strategy';
import { Command, Redis } from 'ioredis';

export class HashInfoStrategy extends AbstractInfoStrategy {
  async getLength(client: Redis, key: RedisString): Promise<number> {
    return await client.sendCommand(new Command('hlen', [key])) as number;
  }
}
