import Redis from 'ioredis';
import {
  IoredisClient,
  RedisClient,
  RedisClientConnectionType,
} from 'src/modules/redis/client';

export class StandaloneIoredisClient extends IoredisClient {
  protected readonly client: Redis;

  /**
   * @inheritDoc
   */
  getConnectionType(): RedisClientConnectionType {
    return RedisClientConnectionType.STANDALONE;
  }

  async nodes(): Promise<RedisClient[]> {
    return [this];
  }

  /**
   * @inheritDoc
   */
  async publish(channel: string, message: string): Promise<number> {
    return this.client.publish(channel, message);
  }

  /**
   * @inheritDoc
   */
  async subscribe(channel: string): Promise<void> {
    const listenerCount = this.client.listenerCount('message');
    if (listenerCount === 0) {
      this.client.on('message', (messageChannel: string, message: string) => {
        this.emit('message', messageChannel, message);
      });
    }
    await this.client.subscribe(channel);
  }

  /**
   * @inheritDoc
   */
  async pSubscribe(channel: string): Promise<void> {
    const listenerCount = this.client.listenerCount('pmessage');
    if (listenerCount === 0) {
      this.client.on('pmessage', (pattern: string, messageChannel: string, message: string) => {
        this.emit('pmessage', pattern, messageChannel, message);
      });
    }
    await this.client.psubscribe(channel);
  }

  /**
   * @inheritDoc
   */
  async unsubscribe(channel: string): Promise<void> {
    await this.client.unsubscribe(channel);
  }

  /**
   * @inheritDoc
   */
  async pUnsubscribe(channel: string): Promise<void> {
    await this.client.punsubscribe(channel);
  }
}
