import { ReplyError } from 'src/models';
import { ClientMetadata } from 'src/common/models';
import { GetKeyInfoResponse, RedisDataType } from 'src/modules/browser/keys/dto';
import {
  BrowserToolKeysCommands,
  BrowserToolRejsonRlCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { RedisString } from 'src/common/constants';
import { TypeInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/type-info.strategy';

export class RejsonRlTypeInfoStrategy extends TypeInfoStrategy {
  public async getInfo(
    clientMetadata: ClientMetadata,
    key: RedisString,
    type: string,
  ): Promise<GetKeyInfoResponse> {
    this.logger.log(`Getting ${RedisDataType.JSON} type info.`);
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
      const length = await this.getLength(clientMetadata, key);
      return {
        name: key,
        type,
        ttl,
        size: size || null,
        length,
      };
    }
  }

  private async getLength(
    clientMetadata: ClientMetadata,
    key: RedisString,
  ): Promise<number> {
    try {
      const objectKeyType = await this.redisManager.execCommand(
        clientMetadata,
        BrowserToolRejsonRlCommands.JsonType,
        [key, '.'],
        'utf8',
      );

      switch (objectKeyType) {
        case 'object':
          return await this.redisManager.execCommand(
            clientMetadata,
            BrowserToolRejsonRlCommands.JsonObjLen,
            [key, '.'],
            'utf8',
          );
        case 'array':
          return await this.redisManager.execCommand(
            clientMetadata,
            BrowserToolRejsonRlCommands.JsonArrLen,
            [key, '.'],
            'utf8',
          );
        case 'string':
          return await this.redisManager.execCommand(
            clientMetadata,
            BrowserToolRejsonRlCommands.JsonStrLen,
            [key, '.'],
            'utf8',
          );
        default:
          return undefined;
      }
    } catch (error) {
      return undefined;
    }
  }
}
