import { get } from 'lodash';
import Redis, { Cluster, Command } from 'ioredis';
import {
  IRedisClientCommandOptions,
  RedisClient,
  RedisClientCommand,
  RedisClientCommandReply,
} from 'src/modules/redis/client';

export abstract class IoredisClient extends RedisClient {
  protected readonly client: Redis | Cluster;

  static prepareCommandOptions(options: IRedisClientCommandOptions): any {
    let replyEncoding = null;

    if (options?.replyEncoding === 'utf8') {
      replyEncoding = 'utf8';
    }

    return {
      replyEncoding,
    };
  }

  /**
   * @inheritDoc
   */
  isConnected(): boolean {
    try {
      return this.client.status === 'ready';
    } catch (e) {
      return false;
    }
  }

  async nodes(): Promise<RedisClient[]> {
    return [this];
  }

  async sendPipeline(
    commands: RedisClientCommand[],
    options?: IRedisClientCommandOptions,
  ): Promise<Array<[Error | null, RedisClientCommandReply]>> {
    let batch = commands;

    if (options?.unknownCommands) {
      batch = commands.map((command) => ['call', ...command]);
    }

    // todo: replyEncoding
    return await this.client.pipeline(batch).exec() as [Error | null, RedisClientCommandReply][];
  }

  async sendCommand(
    command: RedisClientCommand,
    options?: IRedisClientCommandOptions,
  ): Promise<RedisClientCommandReply> {
    const [cmd, ...args] = command;
    return await this.client.sendCommand(
      new Command(cmd, args, IoredisClient.prepareCommandOptions(options)),
    ) as RedisClientCommandReply;
  }

  /** TODO: It's necessary to investigate transactions
  async sendMulti(
    commands: RedisClientCommand[],
    options?: IRedisClientCommandOptions,
  ): Promise<Array<[Error | null, RedisClientCommandReply]>> {
    let batch = commands;

    if (options?.unknownCommands) {
      batch = commands.map((command) => ['call', ...command]);
    }

    return await this.client.multi(batch).exec() as [Error | null, RedisClientCommandReply][];
  }
   */

  async call(command: RedisClientCommand, options?: IRedisClientCommandOptions): Promise<RedisClientCommandReply> {
    if (IoredisClient.prepareCommandOptions(options).replyEncoding === null) {
      return await this.client.callBuffer(...command) as RedisClientCommandReply;
    }

    return await this.client.call(...command) as RedisClientCommandReply;
  }

  async disconnect(): Promise<void> {
    this.client.disconnect();
  }

  async quit(): Promise<void> {
    await this.client.quit();
  }

  async getCurrentDbIndex(): Promise<number> {
    return get(this.client, ['options', 'db'], 0);
  }
}
