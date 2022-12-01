import { ReplyError } from 'src/models/redis-client';
import { Cluster, Redis } from 'ioredis';
import { ClientMetadata } from 'src/common/models';

export interface IRedisConsumer {
  execCommand(
    clientMetadata: ClientMetadata,
    toolCommand: any,
    args: Array<string | number | Buffer>,
  ): any;

  execPipeline(
    clientMetadata: ClientMetadata,
    toolCommands: Array<
    [toolCommand: any, ...args: Array<string | number | Buffer>]
    >,
  ): Promise<[ReplyError | null, any]>;

  execPipelineFromClient(
    client: Redis | Cluster,
    toolCommands: Array<
    [toolCommand: any, ...args: Array<string | number | Buffer>]
    >,
  ): Promise<[ReplyError | null, any]>;
}
