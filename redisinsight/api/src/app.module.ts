import * as fs from 'fs';
import {
  MiddlewareConsumer, Module, NestModule, OnModuleInit,
} from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { RouterModule } from '@nestjs/core';
import { join } from 'path';
import { Response } from 'express';
import config, { Config } from 'src/utils/config';
import { PluginModule } from 'src/modules/plugin/plugin.module';
import { CommandsModule } from 'src/modules/commands/commands.module';
import { WorkbenchModule } from 'src/modules/workbench/workbench.module';
import { SlowLogModule } from 'src/modules/slow-log/slow-log.module';
import { PubSubModule } from 'src/modules/pub-sub/pub-sub.module';
import { NotificationModule } from 'src/modules/notification/notification.module';
import { BulkActionsModule } from 'src/modules/bulk-actions/bulk-actions.module';
import { ClusterMonitorModule } from 'src/modules/cluster-monitor/cluster-monitor.module';
import { DatabaseAnalysisModule } from 'src/modules/database-analysis/database-analysis.module';
import { LocalDatabaseModule } from 'src/local-database.module';
import { CoreModule } from 'src/core.module';
import { AutodiscoveryModule } from 'src/modules/autodiscovery/autodiscovery.module';
import { DatabaseImportModule } from 'src/modules/database-import/database-import.module';
import { SingleUserAuthMiddleware } from 'src/common/middlewares/single-user-auth.middleware';
import { CustomTutorialModule } from 'src/modules/custom-tutorial/custom-tutorial.module';
import { CloudModule } from 'src/modules/cloud/cloud.module';
import { RdiModule } from 'src/modules/rdi/rdi.module';
import { AiModule } from 'src/modules/ai/ai.module';
import { BrowserModule } from './modules/browser/browser.module';
import { RedisEnterpriseModule } from './modules/redis-enterprise/redis-enterprise.module';
import { RedisSentinelModule } from './modules/redis-sentinel/redis-sentinel.module';
import { ProfilerModule } from './modules/profiler/profiler.module';
import { CliModule } from './modules/cli/cli.module';
import { StaticsManagementModule } from './modules/statics-management/statics-management.module';
import { ExcludeRouteMiddleware } from './middleware/exclude-route.middleware';
import SubpathProxyMiddleware from './middleware/subpath-proxy.middleware';
import XFrameOptionsMiddleware from './middleware/x-frame-options.middleware';
import { routes } from './app.routes';
import { RedisConnectionMiddleware, redisConnectionControllers } from './middleware/redis-connection';

const SERVER_CONFIG = config.get('server') as Config['server'];
const PATH_CONFIG = config.get('dir_path') as Config['dir_path'];

const setXFrameOptionsHeader = (res: Response) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
};

@Module({
  imports: [
    LocalDatabaseModule,
    CoreModule,
    RouterModule.register(routes),
    AutodiscoveryModule,
    RedisEnterpriseModule,
    CloudModule.register(),
    RedisSentinelModule,
    BrowserModule.register(),
    CliModule,
    WorkbenchModule.register(),
    PluginModule,
    CommandsModule,
    ProfilerModule,
    PubSubModule,
    SlowLogModule,
    NotificationModule.register(),
    BulkActionsModule,
    ClusterMonitorModule,
    CustomTutorialModule.register(),
    DatabaseAnalysisModule,
    DatabaseImportModule,
    CloudModule.register(),
    AiModule.register(),
    RdiModule.register(),
    ...(SERVER_CONFIG.staticContent
      ? [
        ServeStaticModule.forRoot({
          rootPath: join(__dirname, '..', '..', '..', 'ui', 'dist'),
          exclude: ['/api/**', `${SERVER_CONFIG.customPluginsUri}/**`, `${SERVER_CONFIG.staticUri}/**`],
          serveRoot: SERVER_CONFIG.proxyPath ? `/${SERVER_CONFIG.proxyPath}` : '',
          serveStaticOptions: {
            index: false,
            setHeaders: setXFrameOptionsHeader,
          },
        }),
      ]
      : []),
    ServeStaticModule.forRoot({
      serveRoot: SERVER_CONFIG.customPluginsUri,
      rootPath: join(PATH_CONFIG.customPlugins),
      exclude: ['/api/**'],
      serveStaticOptions: {
        fallthrough: false,
        setHeaders: setXFrameOptionsHeader,
      },
    }),
    ServeStaticModule.forRoot({
      serveRoot: SERVER_CONFIG.staticUri,
      rootPath: join(PATH_CONFIG.staticDir),
      exclude: ['/api/**'],
      serveStaticOptions: {
        fallthrough: false,
        setHeaders: setXFrameOptionsHeader,
      },
    }),
    StaticsManagementModule.register(),
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements OnModuleInit, NestModule {
  onModuleInit() {
    // creating required folders
    const foldersToCreate = [
      PATH_CONFIG.pluginsAssets,
      PATH_CONFIG.customPlugins,
    ];

    foldersToCreate.forEach((folder) => {
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
      }
    });
  }

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SubpathProxyMiddleware, XFrameOptionsMiddleware)
      .forRoutes('*');

    consumer
      .apply(SingleUserAuthMiddleware)
      .exclude(...SERVER_CONFIG.excludeAuthRoutes)
      .forRoutes('*');

    consumer
      .apply(ExcludeRouteMiddleware)
      .forRoutes(
        ...SERVER_CONFIG.excludeRoutes,
      );

    consumer
      .apply(RedisConnectionMiddleware)
      .forRoutes(...redisConnectionControllers);
  }
}
