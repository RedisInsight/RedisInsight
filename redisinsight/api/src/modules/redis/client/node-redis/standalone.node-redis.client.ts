import {
  IRedisClientCommandOptions,
  RedisClientCommand,
  RedisClientCommandReply,
  RedisClientConnectionType,
} from 'src/modules/redis/client';
import { NodeRedis, NodeRedisClient } from 'src/modules/redis/client/node-redis/node-redis.client';

export class StandaloneNodeRedisClient extends NodeRedisClient {
  protected readonly client: NodeRedis;

  /**
   * @inheritDoc
   */
  getConnectionType(): RedisClientConnectionType {
    return RedisClientConnectionType.STANDALONE;
  }

  /**
   * @inheritDoc
   */
  async sendPipeline(commands: RedisClientCommand[]): Promise<Array<[Error | null, RedisClientCommandReply]>> {
    return Promise.all(
      commands.map(
        (cmd) => this.sendCommand(cmd)
          .then((res): [null, RedisClientCommandReply] => [null, res])
          .catch((e): [Error, null] => [e, null]),
      ),
    );
  }

  /**
   * @inheritDoc
   */
  async sendCommand(
    command: RedisClientCommand,
    options?: IRedisClientCommandOptions,
  ): Promise<RedisClientCommandReply> {
    return this.client.sendCommand(
      NodeRedisClient.prepareCommandArgs(command),
      NodeRedisClient.prepareCommandOptions(options),
    );
  }

  /**
   * @inheritDoc
   */
  /** TODO: It's necessary to investigate transactions
  async sendMulti(commands: RedisClientCommand[]): Promise<Array<[Error | null, RedisClientCommandReply]>> {
    return Promise.all(
      commands.map(
        (cmd) => this.sendCommand(cmd)
          .then((res): [null, RedisClientCommandReply] => [null, res])
          .catch((e): [Error, null] => [e, null]),
      ),
    );
  }
   */

  /**
   * @inheritDoc
   */
  async call(command: RedisClientCommand, options?: IRedisClientCommandOptions): Promise<RedisClientCommandReply> {
    return this.sendCommand(command, options);
  }

  /**
   * @inheritDoc
   */
  async publish(channel: string, message: string): Promise<any> {
    return this.client.publish(channel, message);
  }

  /**
   * @inheritDoc
   */
  async subscribe(channel: string): Promise<any> {
    const listener = (message: string, messageChannel : string) => {
      this.emit('message', messageChannel, message);
    };
    return this.client.subscribe(channel, listener);
  }

  /**
   * @inheritDoc
   */
  async pSubscribe(channel: string): Promise<any> {
    const listener = (message: string, messageChannel : string) => {
      this.emit('pmessage', channel, messageChannel, message);
    };
    return this.client.pSubscribe(channel, listener);
  }

  /**
   * @inheritDoc
   */
  async unsubscribe(channel: string): Promise<any> {
    return this.client.unsubscribe(channel);
  }

  /**
   * @inheritDoc
   */
  async pUnsubscribe(channel: string): Promise<any> {
    return this.client.pUnsubscribe(channel);
  }
}
