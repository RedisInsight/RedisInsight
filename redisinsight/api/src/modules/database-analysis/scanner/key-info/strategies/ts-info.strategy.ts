import { RedisString } from 'src/common/constants';
import { AbstractInfoStrategy } from 'src/modules/database-analysis/scanner/key-info/strategies/abstract.info.strategy';
import { Command, Redis } from 'ioredis';
import { convertArrayReplyToObject } from 'src/modules/redis/utils';

export class TsInfoStrategy extends AbstractInfoStrategy {
  async getLength(client: Redis, key: RedisString): Promise<number> {
    const { totalsamples } = convertArrayReplyToObject(
      await client.sendCommand(new Command('ts.info', [key], {
        replyEncoding: 'utf8',
      })) as string[],
    );

    return totalsamples;
  }
}
