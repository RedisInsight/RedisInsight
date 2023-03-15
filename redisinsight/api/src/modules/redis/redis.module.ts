import { Module } from '@nestjs/common';
import { RedisToolFactory } from 'src/modules/redis/redis-tool.factory';
import { RedisService } from 'src/modules/redis/redis.service';
import { RedisConnectionFactory } from 'src/modules/redis/redis-connection.factory';

@Module({
  providers: [
    RedisService,
    RedisToolFactory,
    RedisConnectionFactory,
  ],
  exports: [
    RedisService,
    RedisToolFactory,
    RedisConnectionFactory,
  ],
})
export class RedisModule {}
