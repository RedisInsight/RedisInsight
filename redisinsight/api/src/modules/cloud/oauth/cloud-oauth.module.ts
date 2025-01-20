import { Global, Module } from '@nestjs/common';
import { CloudSessionModule } from 'src/modules/cloud/session/cloud-session.module';
import { OauthUserRepository } from 'src/modules/cloud/oauth/repositories/oauth-user.repository';
import { InSessionCloudUserRepository } from 'src/modules/cloud/oauth/repositories/in-session.cloud-user.repository';
import { CloudOauthController } from 'src/modules/cloud/oauth/cloud-oauth.controller';
import { CloudOauthCapiService } from 'src/modules/cloud/oauth/cloud-oauth.capi.service';
import { CloudUserCapiProvider } from 'src/modules/cloud/oauth/providers/cloud-user.capi.provider';
import { CloudUserApiProvider } from 'src/modules/cloud/oauth/providers/cloud-user.api.provider';
import { CloudOauthApiService } from 'src/modules/cloud/oauth/cloud-oauth.api.service';
import { CloudAuthModule } from 'src/modules/cloud/auth/cloud-auth.module';

@Global()
@Module({
  imports: [CloudSessionModule, CloudAuthModule],
  providers: [
    CloudUserApiProvider,
    CloudUserCapiProvider,
    CloudOauthApiService,
    CloudOauthCapiService,
    {
      provide: OauthUserRepository,
      useClass: InSessionCloudUserRepository,
    },
  ],
  controllers: [CloudOauthController],
  exports: [
    CloudOauthCapiService,
    CloudOauthApiService,
  ],
})
export class CloudOauthModule {}
