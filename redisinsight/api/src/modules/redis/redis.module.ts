import { Module } from '@nestjs/common';
import { RedisToolFactory } from 'src/modules/redis/redis-tool.factory';
import { RedisService } from 'src/modules/redis/redis.service';

@Module({
  providers: [
    RedisService,
    RedisToolFactory,
  ],
  exports: [
    RedisService,
    RedisToolFactory,
  ],
})
export class RedisModule {}
