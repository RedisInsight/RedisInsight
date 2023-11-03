import { ReplyError } from 'src/models';
import { ClientMetadata } from 'src/common/models';
import { GetKeyInfoResponse, RedisDataType } from 'src/modules/browser/keys/dto';
import {
  BrowserToolKeysCommands,
  BrowserToolSetCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { RedisString } from 'src/common/constants';
import { TypeInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/type-info.strategy';

export class SetTypeInfoStrategy extends TypeInfoStrategy {
  public async getInfo(
    clientMetadata: ClientMetadata,
    key: RedisString,
    type: string,
  ): Promise<GetKeyInfoResponse> {
    this.logger.log(`Getting ${RedisDataType.Set} type info.`);
    const [
      transactionError,
      transactionResults,
    ] = await this.redisManager.execPipeline(clientMetadata, [
      [BrowserToolKeysCommands.Ttl, key],
      [BrowserToolKeysCommands.MemoryUsage, key, 'samples', '0'],
      [BrowserToolSetCommands.SCard, key],
    ]);
    if (transactionError) {
      throw transactionError;
    } else {
      const result = transactionResults.map(
        (item: [ReplyError, any]) => item[1],
      );
      const [ttl, size, length] = result;
      return {
        name: key,
        type,
        ttl,
        size: size || null,
        length,
      };
    }
  }
}
