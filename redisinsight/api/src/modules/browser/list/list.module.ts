import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { RouterModule } from 'nest-router';
import { RedisConnectionMiddleware } from 'src/middleware/redis-connection.middleware';
import { ListService } from 'src/modules/browser/list/list.service';
import { ListController } from './list.controller';

@Module({
  // todo: make generic
  imports: [
    RouterModule.forRoutes([
      {
        path: '/databases',
        children: [
          {
            path: '/:dbInstance',
            module: ListModule,
          },
        ],
      },
    ]),
  ],
  controllers: [
    ListController,
  ],
  providers: [
    ListService,
  ],
})
export class ListModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer
      .apply(RedisConnectionMiddleware)
      .forRoutes(
        RouterModule.resolvePath(ListController),
      );
  }
}
