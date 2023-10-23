import { Logger } from '@nestjs/common';
import { ReplyError } from 'src/models';
import { BrowserToolService } from 'src/modules/browser/services/browser-tool/browser-tool.service';
import { ClientMetadata } from 'src/common/models';
import { GetKeyInfoResponse, RedisDataType } from 'src/modules/browser/keys/keys.dto';
import {
  BrowserToolHashCommands,
  BrowserToolKeysCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { RedisString } from 'src/common/constants';
import { IKeyInfoStrategy } from '../../key-info-manager.interface';

export class HashTypeInfoStrategy implements IKeyInfoStrategy {
  private logger = new Logger('HashTypeInfoStrategy');

  private readonly redisManager: BrowserToolService;

  constructor(redisManager: BrowserToolService) {
    this.redisManager = redisManager;
  }

  public async getInfo(
    clientMetadata: ClientMetadata,
    key: RedisString,
    type: string,
  ): Promise<GetKeyInfoResponse> {
    this.logger.log(`Getting ${RedisDataType.Hash} type info.`);
    const [
      transactionError,
      transactionResults,
    ] = await this.redisManager.execPipeline(clientMetadata, [
      [BrowserToolKeysCommands.Ttl, key],
      [BrowserToolKeysCommands.MemoryUsage, key, 'samples', '0'],
      [BrowserToolHashCommands.HLen, key],
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
