import { BrowserToolKeysCommands } from 'src/modules/browser/constants/browser-tool-commands';
import { GetKeyInfoResponse, RedisDataType } from 'src/modules/browser/keys/dto';
import { IRedisConsumer, ReplyError } from 'src/models';
import IORedis, { Redis, Cluster, Command } from 'ioredis';
import { RedisString } from 'src/common/constants';
import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class ScannerStrategy {
  protected redisConsumer: IRedisConsumer;

  protected constructor(redisConsumer: IRedisConsumer) {
    this.redisConsumer = redisConsumer;
  }

  abstract getKeys(clientOptions, args);

  public async getKeyInfo(
    client: Redis | Cluster,
    key: RedisString,
    knownType?: RedisDataType,
  ) {
    const options = {
      replyEncoding: 'utf8' as BufferEncoding,
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
    client: Redis | Cluster,
    keys: RedisString[],
    filterType?: RedisDataType,
  ): Promise<GetKeyInfoResponse[]> {
    if (client.isCluster) {
      return Promise.all(keys.map(async (key) => {
        let ttl;
        let size;
        let type;

        try {
          ttl = await client.sendCommand(
            new Command(BrowserToolKeysCommands.Ttl, [key], { replyEncoding: 'utf8' }),
          ) as number;
        } catch (e) {
          ttl = null;
        }

        try {
          size = await client.sendCommand(
            new Command(
              'memory', ['usage', key, 'samples', '0'], { replyEncoding: 'utf8' },
            ),
          ) as number;
        } catch (e) {
          size = null;
        }

        try {
          type = filterType || await client.sendCommand(
            new Command(BrowserToolKeysCommands.Type, [key], { replyEncoding: 'utf8' }),
          ) as string;
        } catch (e) {
          type = null;
        }

        return {
          name: key,
          type,
          ttl,
          size,
        };
      }));
    }

    const sizeResults = await this.getKeysSize(client, keys);
    const typeResults = filterType
      ? Array(keys.length).fill(filterType)
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
    client: Redis | Cluster,
    keys: RedisString[],
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
      return transactionResults.map((item: [ReplyError, any]) => (item[0] ? null : item[1]));
    }
  }

  protected async getKeysType(
    client: Redis | Cluster,
    keys: RedisString[],
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
      return transactionResults.map((item: [ReplyError, any]) => (item[0] ? null : item[1]));
    }
  }

  protected async getKeysSize(
    client: Redis | Cluster,
    keys: RedisString[],
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
      return transactionResults.map((item: [ReplyError, any]) => (item[0] ? null : item[1]));
    }
  }
}
