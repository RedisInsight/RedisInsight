import { IFindRedisClientInstanceByOptions } from 'src/modules/core/services/redis/redis.service';
import { ReplyError } from 'src/models/redis-client';
import IORedis from 'ioredis';

export interface IRedisConsumer {
  execCommand(
    clientOptions: IFindRedisClientInstanceByOptions,
    toolCommand: any,
    args: Array<string | number | Buffer>,
  ): any;

  execPipeline(
    clientOptions: IFindRedisClientInstanceByOptions,
    toolCommands: Array<
    [toolCommand: any, ...args: Array<string | number | Buffer>]
    >,
  ): Promise<[ReplyError | null, any]>;

  execPipelineFromClient(
    client: IORedis.Redis,
    toolCommands: Array<
    [toolCommand: any, ...args: Array<string | number | Buffer>]
    >,
  ): Promise<[ReplyError | null, any]>;
}
