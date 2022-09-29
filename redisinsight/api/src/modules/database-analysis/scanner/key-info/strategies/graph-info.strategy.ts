import { RedisString } from 'src/common/constants';
import { AbstractInfoStrategy } from 'src/modules/database-analysis/scanner/key-info/strategies/abstract.info.strategy';
import { Command, Redis } from 'ioredis';

export class GraphInfoStrategy extends AbstractInfoStrategy {
  async getLength(client: Redis, key: RedisString): Promise<number> {
    const resp = await client.sendCommand(
      new Command('graph.query', [key, 'MATCH (r) RETURN count(r)', '--compact'], {
        replyEncoding: 'utf8',
      }),
    );

    return resp[1][0][0][1];
  }
}
