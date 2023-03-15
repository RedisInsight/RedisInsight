import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { RouterModule } from 'nest-router';
import { RedisConnectionMiddleware } from 'src/middleware/redis-connection.middleware';
import { StreamController } from 'src/modules/browser/controllers/stream/stream.controller';
import { StreamService } from 'src/modules/browser/services/stream/stream.service';
import { ConsumerGroupController } from 'src/modules/browser/controllers/stream/consumer-group.controller';
import { ConsumerGroupService } from 'src/modules/browser/services/stream/consumer-group.service';
import { ConsumerController } from 'src/modules/browser/controllers/stream/consumer.controller';
import { ConsumerService } from 'src/modules/browser/services/stream/consumer.service';
import { RedisearchController } from 'src/modules/browser/controllers/redisearch/redisearch.controller';
import { RedisearchService } from 'src/modules/browser/services/redisearch/redisearch.service';
import { HashController } from './controllers/hash/hash.controller';
import { KeysController } from './controllers/keys/keys.controller';
import { KeysBusinessService } from './services/keys-business/keys-business.service';
import { StringController } from './controllers/string/string.controller';
import { ListController } from './controllers/list/list.controller';
import { SetController } from './controllers/set/set.controller';
import { ZSetController } from './controllers/z-set/z-set.controller';
import { RejsonRlController } from './controllers/rejson-rl/rejson-rl.controller';
import { HashBusinessService } from './services/hash-business/hash-business.service';
import { SetBusinessService } from './services/set-business/set-business.service';
import { StringBusinessService } from './services/string-business/string-business.service';
import { ListBusinessService } from './services/list-business/list-business.service';
import { ZSetBusinessService } from './services/z-set-business/z-set-business.service';
import { RejsonRlBusinessService } from './services/rejson-rl-business/rejson-rl-business.service';
import { BrowserToolService } from './services/browser-tool/browser-tool.service';
import { BrowserToolClusterService } from './services/browser-tool-cluster/browser-tool-cluster.service';
import { BrowserHistoryService } from './services/browser-history/browser-history.service';
import { BrowserHistoryProvider } from './providers/history/browser-history.provider';
import { BrowserHistoryController } from './controllers/history/browser-history.controller';

@Module({
  controllers: [
    KeysController,
    StringController,
    ListController,
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
    KeysBusinessService,
    StringBusinessService,
    ListBusinessService,
    SetBusinessService,
    ZSetBusinessService,
    RejsonRlBusinessService,
    RedisearchService,
    HashBusinessService,
    StreamService,
    ConsumerGroupService,
    ConsumerService,
    BrowserToolService,
    BrowserToolClusterService,
    BrowserHistoryService,
    BrowserHistoryProvider,
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
        RouterModule.resolvePath(ListController),
        RouterModule.resolvePath(SetController),
        RouterModule.resolvePath(ZSetController),
        RouterModule.resolvePath(RejsonRlController),
        RouterModule.resolvePath(StreamController),
        RouterModule.resolvePath(ConsumerGroupController),
        RouterModule.resolvePath(ConsumerController),
      );
  }
}
