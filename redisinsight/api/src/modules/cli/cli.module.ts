import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { RouterModule } from 'nest-router';
import { RedisConnectionMiddleware } from 'src/middleware/redis-connection.middleware';
import { RedisToolService } from 'src/modules/redis/redis-tool.service';
import { RedisToolFactory } from 'src/modules/redis/redis-tool.factory';
import { CommandsModule } from 'src/modules/commands/commands.module';
import { CommandsService } from 'src/modules/commands/commands.service';
import { CommandsJsonProvider } from 'src/modules/commands/commands-json.provider';
import { ClientContext } from 'src/common/models';
import config from 'src/utils/config';
import { CliController } from './controllers/cli.controller';
import { CliBusinessService } from './services/cli-business/cli-business.service';
import { CliAnalyticsService } from './services/cli-analytics/cli-analytics.service';

const COMMANDS_CONFIGS = config.get('commands');

@Module({
  imports: [CommandsModule],
  controllers: [CliController],
  providers: [
    CliBusinessService,
    CliAnalyticsService,
    {
      provide: RedisToolService,
      useFactory: (redisToolFactory: RedisToolFactory) => redisToolFactory.createRedisTool(
        ClientContext.CLI,
        { enableAutoConnection: false },
      ),
      inject: [RedisToolFactory],
    },
    {
      provide: CommandsService,
      useFactory: () => new CommandsService(
        COMMANDS_CONFIGS.map(({ name, url }) => new CommandsJsonProvider(name, url)),
      ),
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
