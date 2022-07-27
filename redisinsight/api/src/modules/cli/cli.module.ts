import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { RouterModule } from 'nest-router';
import { SharedModule } from 'src/modules/shared/shared.module';
import { RedisConnectionMiddleware } from 'src/middleware/redis-connection.middleware';
import { RedisToolService } from 'src/modules/shared/services/base/redis-tool.service';
import { RedisToolFactory } from 'src/modules/shared/services/base/redis-tool.factory';
import { AppTool } from 'src/models';
import { CliController } from './controllers/cli.controller';
import { CliBusinessService } from './services/cli-business/cli-business.service';
import { CliAnalyticsService } from './services/cli-analytics/cli-analytics.service';
import { CommandsModule } from 'src/modules/commands/commands.module';
import { CommandsService } from 'src/modules/commands/commands.service';
import { CommandsJsonProvider } from 'src/modules/commands/commands-json.provider';
import config from 'src/utils/config';

const COMMANDS_CONFIGS = config.get('commands');

@Module({
  imports: [SharedModule, CommandsModule],
  controllers: [CliController],
  providers: [
    CliBusinessService,
    CliAnalyticsService,
    {
      provide: RedisToolService,
      useFactory: (redisToolFactory: RedisToolFactory) => redisToolFactory.createRedisTool(
        AppTool.CLI,
        { enableAutoConnection: false },
      ),
      inject: [RedisToolFactory],
    },
    {
      provide: CommandsService,
      useFactory: () => new CommandsService(
        COMMANDS_CONFIGS.map(({ name, url }) => new CommandsJsonProvider(name, url)),
      ) 
    },
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
