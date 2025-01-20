import { Module } from '@nestjs/common';
import { CloudSubscriptionCapiService } from 'src/modules/cloud/subscription/cloud-subscription.capi.service';
import { CloudCapiKeyModule } from 'src/modules/cloud/capi-key/cloud-capi-key.module';
import { CloudOauthModule } from 'src/modules/cloud/oauth/cloud-oauth.module';
import { CloudSubscriptionController } from './cloud-subscription.controller';
import { CloudSubscriptionApiService } from './cloud-subscription.api.service';
import { CloudSessionModule } from '../session/cloud-session.module';
import { CloudSubscriptionApiProvider } from './providers/cloud-subscription.api.provider';
import { CloudSubscriptionCapiProvider } from './providers/cloud-subscription.capi.provider';

@Module({
  imports: [
    CloudOauthModule,
    CloudSessionModule,
    CloudCapiKeyModule,
  ],
  providers: [
    CloudSubscriptionApiService,
    CloudSubscriptionApiProvider,
    CloudSubscriptionCapiProvider,
    CloudSubscriptionCapiService,
  ],
  controllers: [
    CloudSubscriptionController,
  ],
  exports: [
    CloudSubscriptionCapiService,
    CloudSubscriptionApiService,
  ],
})
export class CloudSubscriptionModule {}
