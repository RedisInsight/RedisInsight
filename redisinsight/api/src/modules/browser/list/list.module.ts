import {
  DynamicModule,
  MiddlewareConsumer,
  Module,
} from '@nestjs/common';
import { RouterModule } from 'nest-router';
import { RedisConnectionMiddleware } from 'src/middleware/redis-connection.middleware';
import { ListService } from 'src/modules/browser/list/list.service';
import { ListController } from 'src/modules/browser/list/list.controller';

@Module({})
export class ListModule {
  static register({ route }): DynamicModule {
    return {
      module: ListModule,
      imports: [
        RouterModule.forRoutes([{
          path: route,
          module: ListModule,
        }]),
      ],
      controllers: [ListController],
      providers: [ListService],
    };
  }

  configure(consumer: MiddlewareConsumer): any {
    consumer
      .apply(RedisConnectionMiddleware)
      .forRoutes(RouterModule.resolvePath(ListController));
  }
}
