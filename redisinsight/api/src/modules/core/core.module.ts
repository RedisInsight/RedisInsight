import { DynamicModule, Global, Module } from '@nestjs/common';
import { RedisService } from './services/redis/redis.service';

interface IModuleOptions {
  buildType: string;
}

/**
 * Core module
 */
@Global()
@Module({})
export class CoreModule {
  static register(options: IModuleOptions): DynamicModule {
    // TODO: use different module configurations depending on buildType
    return {
      module: CoreModule,
      providers: [
        RedisService,
      ],
      exports: [
        RedisService,
      ],
    };
  }
}
