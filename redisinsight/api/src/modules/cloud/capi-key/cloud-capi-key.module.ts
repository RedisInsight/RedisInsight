import { Module } from '@nestjs/common';
import { CloudCapiKeyController } from 'src/modules/cloud/capi-key/cloud-capi-key.controller';
import { CloudCapiKeyService } from 'src/modules/cloud/capi-key/cloud-capi-key.service';
import { LocalCloudCapiKeyRepository } from 'src/modules/cloud/capi-key/repository/local.cloud-capi-key.repository';
import { CloudCapiKeyRepository } from 'src/modules/cloud/capi-key/repository/cloud-capi-key.repository';
import { CloudCapiKeyApiProvider } from 'src/modules/cloud/capi-key/cloud-capi-key.api.provider';
import { CloudOauthModule } from 'src/modules/cloud/oauth/cloud-oauth.module';
import { CloudSessionModule } from 'src/modules/cloud/session/cloud-session.module';
import { CloudCapiKeyAnalytics } from 'src/modules/cloud/capi-key/cloud-capi-key.analytics';

@Module({
  imports: [
    CloudOauthModule,
    CloudSessionModule,
  ],
  controllers: [CloudCapiKeyController],
  providers: [
    CloudCapiKeyApiProvider,
    CloudCapiKeyService,
    CloudCapiKeyAnalytics,
    {
      provide: CloudCapiKeyRepository,
      useClass: LocalCloudCapiKeyRepository,
    },
  ],
  exports: [
    CloudCapiKeyService,
    CloudCapiKeyApiProvider,
  ],
})
export class CloudCapiKeyModule {}
