import { Module } from '@nestjs/common';
import { CloudSubscriptionCapiProvider } from 'src/modules/cloud/subscription/cloud-subscription.capi.provider';
import { CloudSubscriptionCapiService } from 'src/modules/cloud/subscription/cloud-subscription.capi.service';

@Module({
  providers: [
    CloudSubscriptionCapiProvider,
    CloudSubscriptionCapiService,
  ],
  exports: [
    CloudSubscriptionCapiService,
  ],
})
export class CloudSubscriptionModule {}
