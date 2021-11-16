import { Module } from '@nestjs/common';
import { SharedModule } from 'src/modules/shared/shared.module';
import { ClusterController } from './controllers/cluster.controller';
import { CloudController } from './controllers/cloud.controller';

@Module({
  imports: [SharedModule],
  providers: [],
  controllers: [ClusterController, CloudController],
})
export class RedisEnterpriseModule {}
