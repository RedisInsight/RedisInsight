import {
  DynamicModule,
  MiddlewareConsumer,
  Module,
} from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { RedisConnectionMiddleware } from 'src/middleware/redis-connection.middleware';
import { SetService } from 'src/modules/browser/set/set.service';
import { SetController } from 'src/modules/browser/set/set.controller';

@Module({})
export class SetModule {
  static register({ route }): DynamicModule {
    return {
      module: SetModule,
      imports: [
        RouterModule.register([{
          path: route,
          module: SetModule,
        }]),
      ],
      controllers: [SetController],
      providers: [SetService],
    };
  }

  configure(consumer: MiddlewareConsumer): any {
    consumer
      .apply(RedisConnectionMiddleware)
      .forRoutes(SetController);
  }
}
