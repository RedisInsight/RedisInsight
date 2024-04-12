import { DynamicModule, Global, Module, Type } from '@nestjs/common';
import { RouterModule } from 'nest-router';
import { BrowserHistoryService } from 'src/modules/browser/browser-history/browser-history.service';
import { BrowserHistoryController } from 'src/modules/browser/browser-history/browser-history.controller';
import { BrowserHistoryProvider } from 'src/modules/browser/browser-history/providers/browser-history.provider';
import { LocalBrowserHistoryRepository } from './repositories/local.browser-history.repository';
import { BrowserHistoryRepository } from './repositories/browser-history.repository';

@Global()
@Module({})
export class BrowserHistoryModule {
  static register({ route }, browserHistoryRepository: Type<BrowserHistoryRepository> = LocalBrowserHistoryRepository,): DynamicModule {
    return {
      module: BrowserHistoryModule,
      imports: [
        RouterModule.forRoutes([{
          path: route,
          module: BrowserHistoryModule,
        }]),
      ],
      controllers: [BrowserHistoryController],
      providers: [
        BrowserHistoryService,
        BrowserHistoryProvider,
        {
          provide: BrowserHistoryRepository,
          useClass: browserHistoryRepository,
        }
      ],
      exports: [BrowserHistoryService, BrowserHistoryProvider],
    };
  }
}
