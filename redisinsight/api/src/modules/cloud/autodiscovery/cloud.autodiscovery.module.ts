import { Module } from '@nestjs/common';
import { CloudAutodiscoveryController } from 'src/modules/cloud/autodiscovery/cloud.autodiscovery.controller';
import { CloudAutodiscoveryService } from 'src/modules/cloud/autodiscovery/cloud-autodiscovery.service';
import { CloudAutodiscoveryAnalytics } from 'src/modules/cloud/autodiscovery/cloud-autodiscovery.analytics';

@Module({
  controllers: [CloudAutodiscoveryController],
  providers: [
    CloudAutodiscoveryService,
    CloudAutodiscoveryAnalytics,
  ],
})
export class CloudAutodiscoveryModule {}
