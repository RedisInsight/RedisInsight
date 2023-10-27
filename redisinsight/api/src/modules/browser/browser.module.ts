import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { RouterModule } from 'nest-router';
import { RedisConnectionMiddleware } from 'src/middleware/redis-connection.middleware';
import { StreamController } from 'src/modules/browser/stream/controllers/stream.controller';
import { StreamService } from 'src/modules/browser/stream/services/stream.service';
import { ConsumerGroupController } from 'src/modules/browser/stream/controllers/consumer-group.controller';
import { ConsumerGroupService } from 'src/modules/browser/stream/services/consumer-group.service';
import { ConsumerController } from 'src/modules/browser/stream/controllers/consumer.controller';
import { ConsumerService } from 'src/modules/browser/stream/services/consumer.service';
import { RedisearchController } from 'src/modules/browser/redisearch/redisearch.controller';
import { RedisearchService } from 'src/modules/browser/redisearch/redisearch.service';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import { DatabaseAnalytics } from 'src/modules/database/database.analytics';
import { ListModule } from 'src/modules/browser/list/list.module';
import { HashController } from './hash/hash.controller';
import { KeysController } from './keys/keys.controller';
import { KeysService } from './keys/keys.service';
import { StringController } from './string/string.controller';
import { SetController } from './set/set.controller';
import { ZSetController } from './z-set/z-set.controller';
import { RejsonRlController } from './rejson-rl/rejson-rl.controller';
import { HashService } from './hash/hash.service';
import { SetService } from './set/set.service';
import { StringService } from './string/string.service';
import { ZSetService } from './z-set/z-set.service';
import { RejsonRlService } from './rejson-rl/rejson-rl.service';
import { BrowserToolService } from './services/browser-tool/browser-tool.service';
import { BrowserToolClusterService } from './services/browser-tool-cluster/browser-tool-cluster.service';
import { BrowserHistoryService } from './browser-history/browser-history.service';
import { BrowserHistoryProvider } from './browser-history/providers/browser-history.provider';
import { BrowserHistoryController } from './browser-history/browser-history.controller';

const route = '/databases/:dbInstance';

@Module({
  imports: [
    ListModule.register({ route }),
  ],
  controllers: [
    KeysController,
    StringController,
    SetController,
    ZSetController,
    RejsonRlController,
    RedisearchController,
    HashController,
    StreamController,
    ConsumerGroupController,
    ConsumerController,
    BrowserHistoryController,
  ],
  providers: [
    KeysService,
    StringService,
    SetService,
    ZSetService,
    RejsonRlService,
    RedisearchService,
    HashService,
    StreamService,
    ConsumerGroupService,
    ConsumerService,
    BrowserToolService,
    BrowserToolClusterService,
    BrowserHistoryService,
    BrowserHistoryProvider,
    DatabaseClientFactory,
    DatabaseAnalytics,
  ],
})
export class BrowserModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer
      .apply(RedisConnectionMiddleware)
      .forRoutes(
        RouterModule.resolvePath(KeysController),
        RouterModule.resolvePath(StringController),
        RouterModule.resolvePath(HashController),
        RouterModule.resolvePath(SetController),
        RouterModule.resolvePath(ZSetController),
        RouterModule.resolvePath(RejsonRlController),
        RouterModule.resolvePath(StreamController),
        RouterModule.resolvePath(ConsumerGroupController),
        RouterModule.resolvePath(ConsumerController),
      );
  }
}
