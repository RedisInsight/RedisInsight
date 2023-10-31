import { DynamicModule, Module } from '@nestjs/common';
import { RouterModule } from 'nest-router';
import { RedisearchService } from 'src/modules/browser/redisearch/redisearch.service';
import { RedisearchController } from 'src/modules/browser/redisearch/redisearch.controller';
import { BrowserHistoryService } from 'src/modules/browser/browser-history/browser-history.service';
import { BrowserHistoryProvider } from 'src/modules/browser/browser-history/providers/browser-history.provider';

@Module({})
export class RedisearchModule {
  static register({ route }): DynamicModule {
    return {
      module: RedisearchModule,
      imports: [
        RouterModule.forRoutes([{
          path: route,
          module: RedisearchModule,
        }]),
      ],
      controllers: [RedisearchController],
      providers: [
        RedisearchService,
        BrowserHistoryService,
        BrowserHistoryProvider,
      ],
    };
  }
}
