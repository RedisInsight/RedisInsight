import { Module } from '@nestjs/common';
import { SharedModule } from 'src/modules/shared/shared.module';
import { RedisEnterpriseService } from 'src/modules/redis-enterprise/redis-enterprise.service';
import { RedisCloudService } from 'src/modules/redis-enterprise/redis-cloud.service';
import { RedisEnterpriseAnalytics } from 'src/modules/redis-enterprise/redis-enterprise.analytics';
import { ClusterController } from './controllers/cluster.controller';
import { CloudController } from './controllers/cloud.controller';

@Module({
  imports: [SharedModule],
  controllers: [ClusterController, CloudController],
  providers: [
    RedisEnterpriseService,
    RedisCloudService,
    RedisEnterpriseAnalytics,
  ],
})
export class RedisEnterpriseModule {}
