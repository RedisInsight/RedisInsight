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
      .map((node) => new StandaloneIoredisClient(this.clientMetadata, node));
  }
}
