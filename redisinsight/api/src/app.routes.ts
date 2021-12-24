import { Routes } from 'nest-router';
import { InstancesModule } from 'src/modules/instances/instances.module';
import { BrowserModule } from 'src/modules/browser/browser.module';
import { RedisEnterpriseModule } from 'src/modules/redis-enterprise/redis-enterprise.module';
import { RedisSentinelModule } from 'src/modules/redis-sentinel/redis-sentinel.module';
import { CliModule } from 'src/modules/cli/cli.module';
import { WorkbenchModule } from 'src/modules/workbench/workbench.module';

export const routes: Routes = [
  {
    path: '/instance',
    module: InstancesModule,
    children: [
      {
        path: '/:dbInstance',
        module: BrowserModule,
      },
      {
        path: '/:dbInstance',
        module: CliModule,
      },
      {
        path: '/:dbInstance',
        module: WorkbenchModule,
      },
    ],
  },
  {
    path: '/redis-enterprise',
    module: RedisEnterpriseModule,
  },
  {
    path: '/sentinel',
    module: RedisSentinelModule,
  },
];
