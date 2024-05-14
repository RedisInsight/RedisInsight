import { MiddlewareConsumer, Module } from '@nestjs/common';
import { RouterModule } from 'nest-router';

import { RedisConnectionMiddleware } from 'src/middleware/redis-connection.middleware';
import redisConnectionControllers from './redis-connection-controllers';

@Module({})
export class RedisConnectionModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer
      .apply(RedisConnectionMiddleware)
      .forRoutes(...redisConnectionControllers.map((controller) => RouterModule.resolvePath(controller)));
  }
}
