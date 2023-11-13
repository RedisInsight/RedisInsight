import { DynamicModule, Global, Module } from '@nestjs/common';
import { RouterModule } from 'nest-router';
import { BrowserHistoryService } from 'src/modules/browser/browser-history/browser-history.service';
import { BrowserHistoryController } from 'src/modules/browser/browser-history/browser-history.controller';
import { BrowserHistoryProvider } from 'src/modules/browser/browser-history/providers/browser-history.provider';

@Global()
@Module({})
export class BrowserHistoryModule {
  static register({ route }): DynamicModule {
    return {
      module: BrowserHistoryModule,
      imports: [
        RouterModule.forRoutes([{
          path: route,
          module: BrowserHistoryModule,
        }]),
      ],
      controllers: [BrowserHistoryController],
      providers: [BrowserHistoryService, BrowserHistoryProvider],
      exports: [BrowserHistoryService, BrowserHistoryProvider],
    };
  }
}
