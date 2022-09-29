import * as fs from 'fs';
import {
  MiddlewareConsumer, Module, NestModule, OnModuleInit,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { RouterModule } from 'nest-router';
import { join } from 'path';
import config from 'src/utils/config';
import { PluginModule } from 'src/modules/plugin/plugin.module';
import { CommandsModule } from 'src/modules/commands/commands.module';
import { WorkbenchModule } from 'src/modules/workbench/workbench.module';
import { SlowLogModule } from 'src/modules/slow-log/slow-log.module';
import { PubSubModule } from 'src/modules/pub-sub/pub-sub.module';
import { NotificationModule } from 'src/modules/notification/notification.module';
import { BulkActionsModule } from 'src/modules/bulk-actions/bulk-actions.module';
import { ClusterMonitorModule } from 'src/modules/cluster-monitor/cluster-monitor.module';
import { SharedModule } from './modules/shared/shared.module';
import { InstancesModule } from './modules/instances/instances.module';
import { BrowserModule } from './modules/browser/browser.module';
import { RedisEnterpriseModule } from './modules/redis-enterprise/redis-enterprise.module';
import { RedisSentinelModule } from './modules/redis-sentinel/redis-sentinel.module';
import { ProfilerModule } from './modules/profiler/profiler.module';
import { CliModule } from './modules/cli/cli.module';
import { StaticsManagementModule } from './modules/statics-management/statics-management.module';
import { SettingsController } from './controllers/settings.controller';
import { ServerInfoController } from './controllers/server-info.controller';
import { ExcludeRouteMiddleware } from './middleware/exclude-route.middleware';
import { routes } from './app.routes';
import ormConfig from '../config/ormconfig';

const SERVER_CONFIG = config.get('server');
const PATH_CONFIG = config.get('dir_path');

@Module({
  imports: [
    TypeOrmModule.forRoot(ormConfig),
    RouterModule.forRoutes(routes),
    SharedModule,
    InstancesModule,
    RedisEnterpriseModule,
    RedisSentinelModule,
    BrowserModule,
    CliModule,
    WorkbenchModule,
    PluginModule,
    CommandsModule,
    ProfilerModule,
    PubSubModule,
    SlowLogModule,
    NotificationModule,
    BulkActionsModule,
    ClusterMonitorModule,
    EventEmitterModule.forRoot(),
    ...(SERVER_CONFIG.staticContent
      ? [
        ServeStaticModule.forRoot({
          rootPath: join(__dirname, '..', '..', '..', 'ui', 'dist'),
          exclude: ['/api/**', `${SERVER_CONFIG.customPluginsUri}/**`, `${SERVER_CONFIG.staticUri}/**`],
        }),
      ]
      : []),
    ServeStaticModule.forRoot({
      serveRoot: SERVER_CONFIG.customPluginsUri,
      rootPath: join(PATH_CONFIG.customPlugins),
      exclude: ['/api/**'],
      serveStaticOptions: {
        fallthrough: false,
      },
    }),
    ServeStaticModule.forRoot({
      serveRoot: SERVER_CONFIG.staticUri,
      rootPath: join(PATH_CONFIG.staticDir),
      exclude: ['/api/**'],
      serveStaticOptions: {
        fallthrough: false,
      },
    }),
    StaticsManagementModule,
  ],
  controllers: [SettingsController, ServerInfoController],
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
      .apply(ExcludeRouteMiddleware)
      .forRoutes(
        ...SERVER_CONFIG.excludeRoutes,
      );
  }
}
