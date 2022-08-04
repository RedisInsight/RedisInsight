import { Injectable, Logger } from '@nestjs/common';
import { ReplyError } from 'src/models';
import { BrowserToolService } from 'src/modules/browser/services/browser-tool/browser-tool.service';
import { IFindRedisClientInstanceByOptions } from 'src/modules/core/services/redis/redis.service';
import { GetKeyInfoResponse, RedisDataType } from 'src/modules/browser/dto';
import {
  BrowserToolKeysCommands,
  BrowserToolRejsonRlCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { RedisString } from 'src/common/constants';
import { IKeyInfoStrategy } from '../../key-info-manager.interface';

@Injectable()
export class RejsonRlTypeInfoStrategy implements IKeyInfoStrategy {
  private logger = new Logger('RejsonRlTypeInfoStrategy');

  private readonly redisManager: BrowserToolService;

  constructor(redisManager: BrowserToolService) {
    this.redisManager = redisManager;
  }

  public async getInfo(
    clientOptions: IFindRedisClientInstanceByOptions,
    key: RedisString,
    type: string,
  ): Promise<GetKeyInfoResponse> {
    this.logger.log(`Getting ${RedisDataType.JSON} type info.`);
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
      const length = await this.getLength(clientOptions, key);
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
    clientOptions: IFindRedisClientInstanceByOptions,
    key: RedisString,
  ): Promise<number> {
    try {
      const objectKeyType = await this.redisManager.execCommand(
        clientOptions,
        BrowserToolRejsonRlCommands.JsonType,
        [key, '.'],
        'utf8',
      );

      switch (objectKeyType) {
        case 'object':
          return await this.redisManager.execCommand(
            clientOptions,
            BrowserToolRejsonRlCommands.JsonObjLen,
            [key, '.'],
            'utf8',
          );
        case 'array':
          return await this.redisManager.execCommand(
            clientOptions,
            BrowserToolRejsonRlCommands.JsonArrLen,
            [key, '.'],
            'utf8',
          );
        case 'string':
          return await this.redisManager.execCommand(
            clientOptions,
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
