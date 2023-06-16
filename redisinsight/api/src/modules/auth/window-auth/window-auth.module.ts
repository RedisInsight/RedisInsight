import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import config from 'src/utils/config';
import { WindowAuthManager } from './window-auth.manager';
import { WindowAuthMiddleware } from './middleware/window.auth.middleware';

const SERVER_CONFIG = config.get('server');

@Module({
  providers: [
    WindowAuthManager,
  ],
})

export class WindowAuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(WindowAuthMiddleware)
      .exclude(...SERVER_CONFIG.excludeAuthRoutes)
      .forRoutes('*');
  }
}
