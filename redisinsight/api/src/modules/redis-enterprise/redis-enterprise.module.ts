import { Module } from '@nestjs/common';
import { RedisEnterpriseService } from 'src/modules/redis-enterprise/redis-enterprise.service';
import { RedisEnterpriseAnalytics } from 'src/modules/redis-enterprise/redis-enterprise.analytics';
import { ClusterController } from './controllers/cluster.controller';

@Module({
  controllers: [ClusterController],
  providers: [
    RedisEnterpriseService,
    RedisEnterpriseAnalytics,
  ],
})
export class RedisEnterpriseModule {}
