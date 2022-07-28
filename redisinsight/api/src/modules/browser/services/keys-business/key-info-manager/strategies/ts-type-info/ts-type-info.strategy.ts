import { Logger } from '@nestjs/common';
import { ReplyError } from 'src/models';
import { convertStringsArrayToObject } from 'src/utils';
import { BrowserToolService } from 'src/modules/browser/services/browser-tool/browser-tool.service';
import { IFindRedisClientInstanceByOptions } from 'src/modules/core/services/redis/redis.service';
import { GetKeyInfoResponse, RedisDataType } from 'src/modules/browser/dto';
import {
  BrowserToolKeysCommands,
  BrowserToolTSCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { RedisString } from 'src/common/constants';
import { IKeyInfoStrategy } from '../../key-info-manager.interface';

export class TSTypeInfoStrategy implements IKeyInfoStrategy {
  private logger = new Logger('TSTypeInfoStrategy');

  private readonly redisManager: BrowserToolService;

  constructor(redisManager: BrowserToolService) {
    this.redisManager = redisManager;
  }

  public async getInfo(
    clientOptions: IFindRedisClientInstanceByOptions,
    key: RedisString,
    type: string,
  ): Promise<GetKeyInfoResponse> {
    this.logger.log(`Getting ${RedisDataType.TS} type info.`);
    const [
      transactionError,
      transactionResults,
    ] = await this.redisManager.execPipeline(clientOptions, [
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
      const length = await this.getTotalSamples(clientOptions, key);
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
    clientOptions: IFindRedisClientInstanceByOptions,
    key: RedisString,
  ): Promise<number> {
    try {
      const info = await this.redisManager.execCommand(
        clientOptions,
        BrowserToolTSCommands.TSInfo,
        [key],
      );
      const { totalsamples } = convertStringsArrayToObject(info);
      return totalsamples;
    } catch (error) {
      return undefined;
    }
  }
}
