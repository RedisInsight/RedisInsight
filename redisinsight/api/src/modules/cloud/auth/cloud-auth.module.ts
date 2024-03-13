import { Module } from '@nestjs/common';
import { CloudSessionModule } from 'src/modules/cloud/session/cloud-session.module';
import { GoogleIdpCloudAuthStrategy } from 'src/modules/cloud/auth/auth-strategy/google-idp.cloud.auth-strategy';
import { GithubIdpCloudAuthStrategy } from 'src/modules/cloud/auth/auth-strategy/github-idp.cloud.auth-strategy';
import { CloudAuthService } from 'src/modules/cloud/auth/cloud-auth.service';
import { CloudAuthController } from 'src/modules/cloud/auth/cloud-auth.controller';
import { CloudAuthAnalytics } from 'src/modules/cloud/auth/cloud-auth.analytics';

@Module({
  imports: [CloudSessionModule],
  providers: [
    GoogleIdpCloudAuthStrategy,
    GithubIdpCloudAuthStrategy,
    CloudAuthService,
    CloudAuthAnalytics,
  ],
  controllers: [CloudAuthController],
  exports: [CloudAuthService],
})
export class CloudAuthModule {}
