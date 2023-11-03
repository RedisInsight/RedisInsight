import { ReplyError } from 'src/models';
import { ClientMetadata } from 'src/common/models';
import { GetKeyInfoResponse, RedisDataType } from 'src/modules/browser/keys/dto';
import {
  BrowserToolKeysCommands,
  BrowserToolTSCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { RedisString } from 'src/common/constants';
import { convertArrayReplyToObject } from 'src/modules/redis/utils';
import { TypeInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/type-info.strategy';

export class TsTypeInfoStrategy extends TypeInfoStrategy {
  public async getInfo(
    clientMetadata: ClientMetadata,
    key: RedisString,
    type: string,
  ): Promise<GetKeyInfoResponse> {
    this.logger.log(`Getting ${RedisDataType.TS} type info.`);
    const [
      transactionError,
      transactionResults,
    ] = await this.redisManager.execPipeline(clientMetadata, [
      [BrowserToolKeysCommands.Ttl, key],
      [BrowserToolKeysCommands.MemoryUsage, key, 'samples', '0'],
    ]);
    if (transactionError) {
      throw transactionError;
    } else {
      const result = transactionResults.map(
        (item: [ReplyError, any]) => item[1],
      );
      const [ttl, size] = result;
      const length = await this.getTotalSamples(clientMetadata, key);
      return {
        name: key,
        type,
        ttl,
        size: size || null,
        length,
      };
    }
  }

  private async getTotalSamples(
    clientMetadata: ClientMetadata,
    key: RedisString,
  ): Promise<number> {
    try {
      const info = await this.redisManager.execCommand(
        clientMetadata,
        BrowserToolTSCommands.TSInfo,
        [key],
        'utf8',
      );
      const { totalsamples } = convertArrayReplyToObject(info);
      return totalsamples;
    } catch (error) {
      return undefined;
    }
  }
}
