import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { RouterModule } from 'nest-router';
import { SharedModule } from 'src/modules/shared/shared.module';
import { RedisConnectionMiddleware } from 'src/middleware/redis-connection.middleware';
import { CliController } from './controllers/cli.controller';
import { CliBusinessService } from './services/cli-business/cli-business.service';
import { CliToolService } from './services/cli-tool/cli-tool.service';
import { CliAnalyticsService } from './services/cli-analytics/cli-analytics.service';

@Module({
  imports: [SharedModule],
  controllers: [CliController],
  providers: [
    CliBusinessService,
    CliToolService,
    CliAnalyticsService,
  ],
})
export class CliModule implements NestModule {
  // eslint-disable-next-line class-methods-use-this
  configure(consumer: MiddlewareConsumer): any {
    consumer
      .apply(RedisConnectionMiddleware)
      .forRoutes(RouterModule.resolvePath(CliController));
  }
}
