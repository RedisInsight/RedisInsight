import {
  DynamicModule,
  MiddlewareConsumer,
  Module,
} from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { RedisConnectionMiddleware } from 'src/middleware/redis-connection.middleware';
import { StringService } from 'src/modules/browser/string/string.service';
import { StringController } from 'src/modules/browser/string/string.controller';

@Module({})
export class StringModule {
  static register({ route }): DynamicModule {
    return {
      module: StringModule,
      imports: [
        RouterModule.register([{
          path: route,
          module: StringModule,
        }]),
      ],
      controllers: [StringController],
      providers: [StringService],
    };
  }

  configure(consumer: MiddlewareConsumer): any {
    consumer
      .apply(RedisConnectionMiddleware)
      .forRoutes(StringController);
  }
}
