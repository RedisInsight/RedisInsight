import { Module } from '@nestjs/common';
import { RedisClientFactory } from 'src/modules/redis/redis.client.factory';
import { IoredisRedisConnectionStrategy } from 'src/modules/redis/connection/ioredis.redis.connection.strategy';
import { NodeRedisConnectionStrategy } from 'src/modules/redis/connection/node.redis.connection.strategy';
import { RedisClientStorage } from 'src/modules/redis/redis.client.storage';

@Module({
  providers: [
    RedisClientStorage,
    RedisClientFactory,
    IoredisRedisConnectionStrategy,
    NodeRedisConnectionStrategy,
  ],
  exports: [
    RedisClientStorage,
    RedisClientFactory,
  ],
})
export class RedisModule {}
