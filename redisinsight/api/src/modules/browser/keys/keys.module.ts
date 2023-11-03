import {
  DynamicModule,
  MiddlewareConsumer,
  Module,
} from '@nestjs/common';
import { RouterModule } from 'nest-router';
import { RedisConnectionMiddleware } from 'src/middleware/redis-connection.middleware';
import { KeysController } from 'src/modules/browser/keys/keys.controller';
import { StandaloneScannerStrategy } from 'src/modules/browser/keys/scanner/strategies/standalone.scanner.strategy';
import { ClusterScannerStrategy } from 'src/modules/browser/keys/scanner/strategies/cluster.scanner.strategy';
import { Scanner } from 'src/modules/browser/keys/scanner/scanner';
import { KeysService } from 'src/modules/browser/keys/keys.service';
import { BrowserToolService } from 'src/modules/browser/services/browser-tool/browser-tool.service';
import {
  BrowserToolClusterService,
} from 'src/modules/browser/services/browser-tool-cluster/browser-tool-cluster.service';

@Module({})
export class KeysModule {
  static register({ route }): DynamicModule {
    return {
      module: KeysModule,
      imports: [
        RouterModule.forRoutes([{
          path: route,
          module: KeysModule,
        }]),
      ],
      controllers: [KeysController],
      providers: [
        BrowserToolService,
        BrowserToolClusterService,
        StandaloneScannerStrategy,
        ClusterScannerStrategy,
        Scanner,
        KeysService,
      ],
    };
  }

  configure(consumer: MiddlewareConsumer): any {
    consumer
      .apply(RedisConnectionMiddleware)
      .forRoutes(RouterModule.resolvePath(KeysController));
  }
}
