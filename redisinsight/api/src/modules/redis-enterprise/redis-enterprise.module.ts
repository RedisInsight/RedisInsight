import { Module } from '@nestjs/common';
import { RedisEnterpriseService } from 'src/modules/redis-enterprise/redis-enterprise.service';
import { RedisCloudService } from 'src/modules/redis-enterprise/redis-cloud.service';
import { RedisEnterpriseAnalytics } from 'src/modules/redis-enterprise/redis-enterprise.analytics';
import { ClusterController } from './controllers/cluster.controller';
import { CloudController } from './controllers/cloud.controller';

@Module({
  controllers: [ClusterController, CloudController],
  providers: [
    RedisEnterpriseService,
    RedisCloudService,
    RedisEnterpriseAnalytics,
  ],
})
export class RedisEnterpriseModule {}
