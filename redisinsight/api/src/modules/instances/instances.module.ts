import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { SharedModule } from 'src/modules/shared/shared.module';
import { RedisConnectionMiddleware } from 'src/middleware/redis-connection.middleware';

@Module({
  imports: [SharedModule],
  providers: [],
  controllers: [],
})
export class InstancesModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer
      .apply(RedisConnectionMiddleware)
      .forRoutes({ path: 'instance/:dbInstance/connect', method: RequestMethod.GET });
  }
}
