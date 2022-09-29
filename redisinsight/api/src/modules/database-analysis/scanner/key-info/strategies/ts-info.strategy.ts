import { RedisString } from 'src/common/constants';
import { AbstractInfoStrategy } from 'src/modules/database-analysis/scanner/key-info/strategies/abstract.info.strategy';
import { convertStringsArrayToObject } from 'src/utils';
import { Command, Redis } from 'ioredis';

export class TsInfoStrategy extends AbstractInfoStrategy {
  async getLength(client: Redis, key: RedisString): Promise<number> {
    const { totalsamples } = convertStringsArrayToObject(
      await client.sendCommand(new Command('ts.info', [key], {
        replyEncoding: 'utf8',
      })) as string[],
    );

    return totalsamples;
  }
}
