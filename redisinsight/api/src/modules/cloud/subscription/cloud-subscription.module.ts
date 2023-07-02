import { Module } from '@nestjs/common';
import { CloudSubscriptionApiService } from 'src/modules/cloud/subscription/cloud-subscription.api.service';
import { CloudSubscriptionService } from 'src/modules/cloud/subscription/cloud-subscription.service';

@Module({
  providers: [
    CloudSubscriptionApiService,
    CloudSubscriptionService,
  ],
  exports: [
    CloudSubscriptionService,
  ],
})
export class CloudSubscriptionModule {}
