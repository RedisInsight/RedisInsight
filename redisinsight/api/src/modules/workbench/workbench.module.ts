import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { WorkbenchController } from 'src/modules/workbench/workbench.controller';
import { RedisConnectionMiddleware } from 'src/middleware/redis-connection.middleware';
import { RouterModule } from 'nest-router';
import { SharedModule } from 'src/modules/shared/shared.module';
import { WorkbenchService } from 'src/modules/workbench/workbench.service';
import { WorkbenchCommandsExecutor } from 'src/modules/workbench/providers/workbench-commands.executor';
import { CommandExecutionProvider } from 'src/modules/workbench/providers/command-execution.provider';
import { CoreModule } from 'src/modules/core/core.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommandExecutionEntity } from 'src/modules/workbench/entities/command-execution.entity';
import { RedisToolService } from 'src/modules/shared/services/base/redis-tool.service';
import { RedisToolFactory } from 'src/modules/shared/services/base/redis-tool.factory';
import { AppTool } from 'src/models';
import { PluginsService } from 'src/modules/workbench/plugins.service';
import { PluginCommandsWhitelistProvider } from 'src/modules/workbench/providers/plugin-commands-whitelist.provider';
import { PluginsController } from 'src/modules/workbench/plugins.controller';
import { PluginStateProvider } from 'src/modules/workbench/providers/plugin-state.provider';
import { PluginStateEntity } from 'src/modules/workbench/entities/plugin-state.entity';
import { WorkbenchAnalyticsService } from './services/workbench-analytics/workbench-analytics.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CommandExecutionEntity,
      PluginStateEntity,
    ]),
    CoreModule,
    SharedModule,
  ],
  controllers: [
    WorkbenchController,
    PluginsController,
  ],
  providers: [
    WorkbenchService,
    WorkbenchCommandsExecutor,
    CommandExecutionProvider,
    {
      provide: RedisToolService,
      useFactory: (redisToolFactory: RedisToolFactory) => redisToolFactory.createRedisTool(AppTool.Workbench),
      inject: [RedisToolFactory],
    },
    PluginsService,
    PluginCommandsWhitelistProvider,
    PluginStateProvider,
    WorkbenchAnalyticsService,
  ],
})
export class WorkbenchModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer
      .apply(RedisConnectionMiddleware)
      .forRoutes(RouterModule.resolvePath(WorkbenchController));
  }
}
