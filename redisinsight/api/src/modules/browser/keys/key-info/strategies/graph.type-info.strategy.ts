import { ReplyError } from 'src/models';
import { ClientMetadata } from 'src/common/models';
import { GetKeyInfoResponse, RedisDataType } from 'src/modules/browser/keys/dto';
import {
  BrowserToolGraphCommands,
  BrowserToolKeysCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { RedisString } from 'src/common/constants';
import { TypeInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/type-info.strategy';

export class GraphTypeInfoStrategy extends TypeInfoStrategy {
  public async getInfo(
    clientMetadata: ClientMetadata,
    key: RedisString,
    type: string,
  ): Promise<GetKeyInfoResponse> {
    this.logger.log(`Getting ${RedisDataType.Graph} type info.`);
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
      const length = await this.getNodesCount(clientMetadata, key);
      return {
        name: key,
        type,
        ttl,
        size: size || null,
        length,
      };
    }
  }

  private async getNodesCount(
    clientMetadata: ClientMetadata,
    key: RedisString,
  ): Promise<number> {
    try {
      const queryReply = await this.redisManager.execCommand(
        clientMetadata,
        BrowserToolGraphCommands.GraphQuery,
        [key, 'MATCH (r) RETURN count(r)', '--compact'],
      );
      return queryReply[1][0][0][1];
    } catch (error) {
      return undefined;
    }
  }
}
