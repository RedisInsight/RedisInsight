import { Module } from '@nestjs/common';
import { RedisToolFactory } from 'src/modules/redis/redis-tool.factory';
import { RedisService } from 'src/modules/redis/redis.service';
import { RedisConnectionFactory } from 'src/modules/redis/redis-connection.factory';
import { RedisClientFactory } from 'src/modules/redis/redis.client.factory';
import { IoredisRedisConnectionStrategy } from 'src/modules/redis/connection/ioredis.redis.connection.strategy';
import { NodeRedisConnectionStrategy } from 'src/modules/redis/connection/node.redis.connection.strategy';
import { RedisClientProvider } from 'src/modules/redis/redis.client.provider';

@Module({
  providers: [
    RedisClientProvider,
    RedisClientFactory,
    IoredisRedisConnectionStrategy,
    NodeRedisConnectionStrategy,
    // todo: remove providers below
    RedisService,
    RedisToolFactory,
    RedisConnectionFactory,
  ],
  exports: [
    RedisClientProvider,
    RedisClientFactory,
    // todo: remove providers below
    RedisService,
    RedisToolFactory,
    RedisConnectionFactory,
  ],
})
export class RedisModule {}
