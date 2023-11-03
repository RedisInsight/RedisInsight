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
import { KeyInfoProvider } from 'src/modules/browser/keys/key-info/key-info.provider';
import { GraphTypeInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/graph.type-info.strategy';
import { HashTypeInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/hash.type-info.strategy';
import { ListTypeInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/list.type-info.strategy';
import { RejsonRlTypeInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/rejson-rl.type-info.strategy';
import { SetTypeInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/set.type-info.strategy';
import { StreamTypeInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/stream.type-info.strategy';
import { StringTypeInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/string.type-info.strategy';
import { TsTypeInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/ts.type-info.strategy';
import {
  UnsupportedTypeInfoStrategy,
} from 'src/modules/browser/keys/key-info/strategies/unsupported.type-info.strategy';
import { ZSetTypeInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/z-set.type-info.strategy';

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
        KeyInfoProvider,
        // scanner strategies
        StandaloneScannerStrategy,
        ClusterScannerStrategy,
        // key info strategies
        GraphTypeInfoStrategy,
        HashTypeInfoStrategy,
        ListTypeInfoStrategy,
        RejsonRlTypeInfoStrategy,
        SetTypeInfoStrategy,
        StreamTypeInfoStrategy,
        StringTypeInfoStrategy,
        TsTypeInfoStrategy,
        UnsupportedTypeInfoStrategy,
        ZSetTypeInfoStrategy,
      ],
    };
  }

  configure(consumer: MiddlewareConsumer): any {
    consumer
      .apply(RedisConnectionMiddleware)
      .forRoutes(RouterModule.resolvePath(KeysController));
  }
}
