import { BrowserToolKeysCommands } from 'src/modules/browser/constants/browser-tool-commands';
import { GetKeyInfoResponse, RedisDataType } from 'src/modules/browser/dto';
import { IRedisConsumer, ReplyError } from 'src/models';
import IORedis from 'ioredis';
import { IScannerStrategy } from '../scanner.interface';

export abstract class AbstractStrategy implements IScannerStrategy {
  protected redisConsumer: IRedisConsumer;

  protected constructor(redisConsumer: IRedisConsumer) {
    this.redisConsumer = redisConsumer;
  }

  abstract getKeys(clientOptions, args);

  public async getKeyInfo(
    client: IORedis.Redis | IORedis.Cluster,
    key: string,
    knownType?: RedisDataType,
  ) {
    const options = {
      replyEncoding: 'utf8',
    };

    // @ts-ignore
    const size = await client.sendCommand(new IORedis.Command(
      'memory',
      ['usage', key, 'samples', '0'],
      options,
    ));

    const type = knownType
      // @ts-ignore
      || await client.sendCommand(new IORedis.Command(
        BrowserToolKeysCommands.Type,
        [key],
        options,
      ));

    // @ts-ignore
    const ttl = await client.sendCommand(new IORedis.Command(
      BrowserToolKeysCommands.Ttl,
      [key],
      options,
    ));

    return {
      name: key,
      type,
      ttl,
      size,
    };
  }

  public async getKeysInfo(
    client: IORedis.Redis,
    keys: string[],
    type?: RedisDataType,
  ): Promise<GetKeyInfoResponse[]> {
    const sizeResults = await this.getKeysSize(client, keys);
    const typeResults = type
      ? Array(keys.length).fill(type)
      : await this.getKeysType(client, keys);
    const ttlResults = await this.getKeysTtl(client, keys);
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
    client: IORedis.Redis,
    keys: string[],
  ): Promise<GetKeyInfoResponse> {
    const [
      transactionError,
      transactionResults,
    ] = await this.redisConsumer.execPipelineFromClient(
      client,
      keys.map((key: string) => [BrowserToolKeysCommands.Ttl, key]),
    );
    if (transactionError) {
      throw transactionError;
    } else {
      return transactionResults.map((item: [ReplyError, any]) => item[1]);
    }
  }

  protected async getKeysType(
    client: IORedis.Redis,
    keys: string[],
  ): Promise<GetKeyInfoResponse> {
    const [
      transactionError,
      transactionResults,
    ] = await this.redisConsumer.execPipelineFromClient(
      client,
      keys.map((key: string) => [BrowserToolKeysCommands.Type, key]),
    );
    if (transactionError) {
      throw transactionError;
    } else {
      return transactionResults.map((item: [ReplyError, any]) => item[1]);
    }
  }

  protected async getKeysSize(
    client: IORedis.Redis,
    keys: string[],
  ): Promise<GetKeyInfoResponse> {
    const [
      transactionError,
      transactionResults,
    ] = await this.redisConsumer.execPipelineFromClient(
      client,
      keys.map<[toolCommand: any, ...args: Array<string | number | Buffer>]>(
        (key: string) => [
          BrowserToolKeysCommands.MemoryUsage,
          key,
          'samples',
          '0',
        ],
      ),
    );
    if (transactionError) {
      throw transactionError;
    } else {
      // Remove the result for TTL command and returns only results for 'MEMORY USAGE'
      transactionResults.shift();
      return transactionResults.map((item: [ReplyError, any]) => item[1]);
    }
  }
}
