import { GetKeyInfoResponse, RedisDataType } from 'src/modules/browser/keys/dto';
import {
  BrowserToolKeysCommands,
  BrowserToolStreamCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { RedisString } from 'src/common/constants';
import { KeyInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/key-info.strategy';
import { RedisClient } from 'src/modules/redis/client';

export class StreamKeyInfoStrategy extends KeyInfoStrategy {
  public async getInfo(
    client: RedisClient,
    key: RedisString,
    type: string,
  ): Promise<GetKeyInfoResponse> {
    this.logger.debug(`Getting ${RedisDataType.Stream} type info.`);

    const [
      [, ttl = null],
      [, size = null],
      [, length = null],
    ] = await client.sendPipeline([
      [BrowserToolKeysCommands.Ttl, key],
      [BrowserToolKeysCommands.MemoryUsage, key, 'samples', '0'],
      [BrowserToolStreamCommands.XLen, key],
    ]) as [any, number][];

    return {
      name: key,
      type,
      ttl,
      size,
      length,
    };
  }
}
