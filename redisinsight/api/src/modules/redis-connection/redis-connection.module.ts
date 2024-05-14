import { MiddlewareConsumer, Module } from '@nestjs/common';

import { RedisConnectionMiddleware } from 'src/middleware/redis-connection.middleware';
import redisConnectionRoutes from './redis-connection-routes';

@Module({})
export class RedisConnectionModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer
      .apply(RedisConnectionMiddleware)
      .forRoutes(...redisConnectionRoutes);
  }
}
