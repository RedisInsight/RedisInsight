import { isNull, isNumber } from 'lodash';
import { createClient, createCluster } from 'redis';
import { IRedisClientCommandOptions, RedisClient, RedisClientCommand } from 'src/modules/redis/client';
import { RedisString } from 'src/common/constants';

export type NodeRedis = ReturnType<typeof createClient>;
export type NodeRedisCluster = ReturnType<typeof createCluster>;

export abstract class NodeRedisClient extends RedisClient {
  protected readonly client: NodeRedis | NodeRedisCluster;

  static prepareCommandOptions(options: IRedisClientCommandOptions): any {
    return {
      returnBuffers: isNull(options?.replyEncoding),
    };
  }

  static prepareCommandArgs(args: RedisClientCommand): RedisString[] {
    return args.map((arg) => (isNumber(arg) ? arg.toString() : arg));
  }

  async nodes(): Promise<RedisClient[]> {
    return [this];
  }

  /**
   * @inheritDoc
   */
  isConnected(): boolean {
    // todo: find a way
    return true;
  //   try {
  //     return this.client.status === 'ready';
  //   } catch (e) {
  //     return false;
  //   }
  }

  /**
   * @inheritDoc
   */
  async disconnect(): Promise<void> {
    this.client.disconnect();
  }

  /**
   * @inheritDoc
   */
  async quit(): Promise<void> {
    await this.client.quit();
  }
}
