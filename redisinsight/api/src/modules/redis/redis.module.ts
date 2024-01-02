import { Module } from '@nestjs/common';
import { RedisService } from 'src/modules/redis/redis.service';
import { RedisConnectionFactory } from 'src/modules/redis/redis-connection.factory';
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
    // todo: remove providers below
    RedisService,
    RedisConnectionFactory,
  ],
  exports: [
    RedisClientStorage,
    RedisClientFactory,
    // todo: remove providers below
    RedisService,
    RedisConnectionFactory,
  ],
})
export class RedisModule {}
