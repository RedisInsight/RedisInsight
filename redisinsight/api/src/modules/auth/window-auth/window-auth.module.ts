import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import config, { Config } from '../../../utils/config';
import { WindowAuthService } from './window-auth.service';
import { WindowAuthMiddleware } from './middleware/window.auth.middleware';
import { ElectronWindowAuthStrategy } from './strategies/electron.window.auth.strategy';

const SERVER_CONFIG = config.get('server') as Config['server'];

@Module({
  providers: [
    WindowAuthService,
    ElectronWindowAuthStrategy,
  ],
  exports: [WindowAuthService],
})
export class WindowAuthModule implements NestModule {
  constructor(
    private readonly windowAuthService: WindowAuthService,
    private readonly electronStrategy: ElectronWindowAuthStrategy,
  ) {
    if (process.env.RI_APP_TYPE === 'electron' && process.env.NODE_ENV === 'development') {
      this.windowAuthService.setStrategy(this.electronStrategy);
    }
  }

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(WindowAuthMiddleware)
      .exclude(
        ...SERVER_CONFIG.excludeAuthRoutes,
        '/static/(.*)', // Exclude all static content
      )
      .forRoutes('*');
  }
}
