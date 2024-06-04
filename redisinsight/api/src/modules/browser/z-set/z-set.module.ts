import {
  DynamicModule,
  MiddlewareConsumer,
  Module,
} from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { RedisConnectionMiddleware } from 'src/middleware/redis-connection.middleware';
import { ZSetService } from 'src/modules/browser/z-set/z-set.service';
import { ZSetController } from 'src/modules/browser/z-set/z-set.controller';

@Module({})
export class ZSetModule {
  static register({ route }): DynamicModule {
    return {
      module: ZSetModule,
      imports: [
        RouterModule.register([{
          path: route,
          module: ZSetModule,
        }]),
      ],
      controllers: [ZSetController],
      providers: [ZSetService],
    };
  }

  configure(consumer: MiddlewareConsumer): any {
    consumer
      .apply(RedisConnectionMiddleware)
      .forRoutes(ZSetController);
  }
}
