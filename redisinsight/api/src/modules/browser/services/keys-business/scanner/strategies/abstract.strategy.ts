import { IFindRedisClientInstanceByOptions } from 'src/modules/core/services/redis/redis.service';
import { BrowserToolKeysCommands } from 'src/modules/browser/constants/browser-tool-commands';
import { GetKeyInfoResponse, RedisDataType } from 'src/modules/browser/dto';
import { IRedisConsumer, ReplyError } from 'src/models';
import { IScannerStrategy } from '../scanner.interface';

export abstract class AbstractStrategy implements IScannerStrategy {
  protected redisConsumer: IRedisConsumer;

  protected constructor(redisConsumer: IRedisConsumer) {
    this.redisConsumer = redisConsumer;
  }

  abstract getKeys(clientOptions, args);

  public async getKeysInfo(
    clientOptions: IFindRedisClientInstanceByOptions,
    keys: string[],
    type?: RedisDataType,
  ): Promise<GetKeyInfoResponse[]> {
    const sizeResults = await this.getKeysSize(clientOptions, keys);
    const typeResults = type
      ? Array(keys.length).fill(type)
      : await this.getKeysType(clientOptions, keys);
    const ttlResults = await this.getKeysTtl(clientOptions, keys);
    return keys.map(
      (key: string, index: number): GetKeyInfoResponse => ({
        name: key,
        type: typeResults[index],
        ttl: ttlResults[index],
        size: sizeResults[index],
      }),
    );
  }

  protected async getKeysTtl(
    clientOptions: IFindRedisClientInstanceByOptions,
    keys: string[],
  ): Promise<GetKeyInfoResponse> {
    const [
      transactionError,
      transactionResults,
    ] = await this.redisConsumer.execPipeline(
      clientOptions,
      keys.map((key: string) => [BrowserToolKeysCommands.Ttl, key]),
    );
    if (transactionError) {
      throw transactionError;
    } else {
      return transactionResults.map((item: [ReplyError, any]) => item[1]);
    }
  }

  protected async getKeysType(
    clientOptions: IFindRedisClientInstanceByOptions,
    keys: string[],
  ): Promise<GetKeyInfoResponse> {
    const [
      transactionError,
      transactionResults,
    ] = await this.redisConsumer.execPipeline(
      clientOptions,
      keys.map((key: string) => [BrowserToolKeysCommands.Type, key]),
    );
    if (transactionError) {
      throw transactionError;
    } else {
      return transactionResults.map((item: [ReplyError, any]) => item[1]);
    }
  }

  protected async getKeysSize(
    clientOptions: IFindRedisClientInstanceByOptions,
    keys: string[],
  ): Promise<GetKeyInfoResponse> {
    const [
      transactionError,
      transactionResults,
    ] = await this.redisConsumer.execPipeline(clientOptions, [
      // HACK: for OSS CLUSTER, for some reason, if the pipeline contains only 'MEMORY USAGE' commands
      // IORedis.Cluster sometimes incorrectly determines for which node it is necessary to execute it.
      // To fix it we insert one TTL command (with the key that belongs to the required node)
      // at the head of the pipeline.
      // And late we remove the result for TTL command and returns only results for 'MEMORY USAGE'
      [BrowserToolKeysCommands.Ttl, keys[0]],
      ...keys.map<[toolCommand: any, ...args: Array<string | number | Buffer>]>(
        (key: string) => [
          BrowserToolKeysCommands.MemoryUsage,
          key,
          'samples',
          '0',
        ],
      ),
    ]);
    if (transactionError) {
      throw transactionError;
    } else {
      // Remove the result for TTL command and returns only results for 'MEMORY USAGE'
      transactionResults.shift();
      return transactionResults.map((item: [ReplyError, any]) => item[1]);
    }
  }
}
