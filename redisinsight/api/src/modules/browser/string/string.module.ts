import {
  DynamicModule,
  MiddlewareConsumer,
  Module,
} from '@nestjs/common';
import { RouterModule } from 'nest-router';
import { RedisConnectionMiddleware } from 'src/middleware/redis-connection.middleware';
import { StringService } from 'src/modules/browser/string/string.service';
import { StringController } from 'src/modules/browser/string/string.controller';

@Module({})
export class StringModule {
  static register({ route }): DynamicModule {
    return {
      module: StringModule,
      imports: [
        RouterModule.forRoutes([{
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
      .forRoutes(RouterModule.resolvePath(StringController));
  }
}
