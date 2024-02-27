import {
  DynamicModule,
  MiddlewareConsumer,
  Module,
} from '@nestjs/common';
import { RouterModule } from 'nest-router';
import { RedisConnectionMiddleware } from 'src/middleware/redis-connection.middleware';
import { StreamController } from 'src/modules/browser/stream/controllers/stream.controller';
import { ConsumerController } from 'src/modules/browser/stream/controllers/consumer.controller';
import { ConsumerGroupController } from 'src/modules/browser/stream/controllers/consumer-group.controller';
import { StreamService } from 'src/modules/browser/stream/services/stream.service';
import { ConsumerService } from 'src/modules/browser/stream/services/consumer.service';
import { ConsumerGroupService } from 'src/modules/browser/stream/services/consumer-group.service';

@Module({})
export class StreamModule {
  static register({ route }): DynamicModule {
    return {
      module: StreamModule,
      imports: [
        RouterModule.forRoutes([{
          path: route,
          module: StreamModule,
        }]),
      ],
      controllers: [
        StreamController,
        ConsumerController,
        ConsumerGroupController,
      ],
      providers: [
        StreamService,
        ConsumerService,
        ConsumerGroupService,
      ],
    };
  }

  configure(consumer: MiddlewareConsumer): any {
    consumer
      .apply(RedisConnectionMiddleware)
      .forRoutes(
        RouterModule.resolvePath(StreamController),
        RouterModule.resolvePath(ConsumerGroupController),
        RouterModule.resolvePath(ConsumerController),
      );
  }
}
