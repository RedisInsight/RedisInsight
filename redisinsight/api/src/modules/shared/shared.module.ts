import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import config from 'src/utils/config';
import { CoreModule } from 'src/modules/core/core.module';
import { DatabasesProvider } from 'src/modules/shared/services/instances-business/databases.provider';
import { RedisToolFactory } from 'src/modules/shared/services/base/redis-tool.factory';
import { StackDatabasesProvider } from 'src/modules/shared/services/instances-business/stack.databases.provider';
import { AutoDiscoveryService } from 'src/modules/shared/services/instances-business/auto-discovery.service';
import { DatabaseEntity } from 'src/modules/database/entities/database.entity';
import { InstancesBusinessService } from './services/instances-business/instances-business.service';
import { RedisEnterpriseBusinessService } from './services/redis-enterprise-business/redis-enterprise-business.service';
import { RedisCloudBusinessService } from './services/redis-cloud-business/redis-cloud-business.service';
import { ConfigurationBusinessService } from './services/configuration-business/configuration-business.service';
import { InstancesAnalyticsService } from './services/instances-business/instances-analytics.service';
import {
  AutodiscoveryAnalyticsService,
} from './services/autodiscovery-analytics.service/autodiscovery-analytics.service';

const SERVER_CONFIG = config.get('server');

@Module({
  imports: [
    CoreModule.register({
      buildType: SERVER_CONFIG.buildType,
    }),
    TypeOrmModule.forFeature([DatabaseEntity]),
  ],
  providers: [
    {
      provide: DatabasesProvider,
      useClass: SERVER_CONFIG.buildType === 'REDIS_STACK' ? StackDatabasesProvider : DatabasesProvider,
    },
    InstancesBusinessService,
    InstancesAnalyticsService,
    RedisEnterpriseBusinessService,
    RedisCloudBusinessService,
    ConfigurationBusinessService,
    AutodiscoveryAnalyticsService,
    RedisToolFactory,
    AutoDiscoveryService,
  ],
  exports: [
    InstancesBusinessService,
    RedisEnterpriseBusinessService,
    RedisCloudBusinessService,
    ConfigurationBusinessService,
    RedisToolFactory,
  ],
})
export class SharedModule {}
