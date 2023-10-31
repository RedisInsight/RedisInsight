import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { RouterModule } from 'nest-router';
import { RedisConnectionMiddleware } from 'src/middleware/redis-connection.middleware';
import { RedisearchController } from 'src/modules/browser/redisearch/redisearch.controller';
import { RedisearchService } from 'src/modules/browser/redisearch/redisearch.service';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import { DatabaseAnalytics } from 'src/modules/database/database.analytics';
import { ListModule } from 'src/modules/browser/list/list.module';
import { HashModule } from 'src/modules/browser/hash/hash.module';
import { ZSetModule } from 'src/modules/browser/z-set/z-set.module';
import { StringModule } from 'src/modules/browser/string/string.module';
import { SetModule } from 'src/modules/browser/set/set.module';
import { BrowserHistoryModule } from 'src/modules/browser/browser-history/browser-history.module';
import { RejsonRlModule } from 'src/modules/browser/rejson-rl/rejson-rl.module';
import { StreamModule } from 'src/modules/browser/stream/stream.module';
import { KeysController } from './keys/keys.controller';
import { KeysService } from './keys/keys.service';
import { BrowserToolService } from './services/browser-tool/browser-tool.service';
import { BrowserToolClusterService } from './services/browser-tool-cluster/browser-tool-cluster.service';

const route = '/databases/:dbInstance';

@Module({
  imports: [
    ListModule.register({ route }),
    HashModule.register({ route }),
    ZSetModule.register({ route }),
    StringModule.register({ route }),
    SetModule.register({ route }),
    BrowserHistoryModule.register({ route }),
    StreamModule.register({ route }),
    RejsonRlModule.register({ route }),
  ],
  controllers: [
    KeysController,
    RedisearchController,
  ],
  providers: [
    KeysService,
    RedisearchService,
    BrowserToolService,
    BrowserToolClusterService,
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
      );
  }
}
