import { Redis, Cluster } from 'ioredis';
import { RedisString } from 'src/common/constants';

export interface IntegersInSets {
  client: Redis | Cluster;
  keyName: RedisString;
  databaseId: string;
  members: RedisString[];
}
