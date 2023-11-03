import { DynamicModule, Module } from '@nestjs/common';
import { RouterModule } from 'nest-router';
import { RedisearchService } from 'src/modules/browser/redisearch/redisearch.service';
import { RedisearchController } from 'src/modules/browser/redisearch/redisearch.controller';

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
      ],
    };
  }
}
