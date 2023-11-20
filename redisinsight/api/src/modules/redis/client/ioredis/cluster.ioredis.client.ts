import { Cluster } from 'ioredis';
import {
  RedisClient, RedisClientConnectionType, IoredisClient, StandaloneIoredisClient, RedisClientNodeRole,
} from 'src/modules/redis/client';

enum IoredisNodeRole {
  PRIMARY = 'master',
  SECONDARY = 'slave',
  ALL = 'all',
}

export class ClusterIoredisClient extends IoredisClient {
  protected readonly client: Cluster;

  getConnectionType(): RedisClientConnectionType {
    return RedisClientConnectionType.CLUSTER;
  }

  async nodes(role?: RedisClientNodeRole): Promise<RedisClient[]> {
    return this.client.nodes(role ? IoredisNodeRole[role] : IoredisNodeRole.ALL)
      .map((node) => new StandaloneIoredisClient(
        this.clientMetadata,
        node,
        {
          host: node.options.host,
          port: node.options.port,
        },
      ));
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
    const listenerCount = this.client.listenerCount('message');
    if (listenerCount === 0) {
      this.client.on('message', (messageChannel: string, message: string) => {
        this.emit('message', messageChannel, message);
      });
    }
    return this.client.subscribe(channel);
  }

  /**
   * @inheritDoc
   */
  async pSubscribe(channel: string): Promise<any> {
    const listenerCount = this.client.listenerCount('pmessage');
    if (listenerCount === 0) {
      this.client.on('pmessage', (pattern: string, messageChannel: string, message: string) => {
        this.emit('pmessage', pattern, messageChannel, message);
      });
    }
    return this.client.psubscribe(channel);
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
    return this.client.punsubscribe(channel);
  }
}
