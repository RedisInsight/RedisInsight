import { Module } from '@nestjs/common';
import { CloudSessionModule } from 'src/modules/cloud/session/cloud-session.module';
import { GoogleIdpCloudAuthStrategy } from 'src/modules/cloud/auth/auth-strategy/google-idp.cloud.auth-strategy';
import { GithubIdpCloudAuthStrategy } from 'src/modules/cloud/auth/auth-strategy/github-idp.cloud.auth-strategy';
import { SsoIdpCloudAuthStrategy } from 'src/modules/cloud/auth/auth-strategy/sso-idp.cloud.auth-strategy';
import { CloudAuthService } from 'src/modules/cloud/auth/cloud-auth.service';
import { CloudAuthController } from 'src/modules/cloud/auth/cloud-auth.controller';
import { CloudAuthAnalytics } from 'src/modules/cloud/auth/cloud-auth.analytics';
import { TcpCloudAuthStrategy } from './auth-strategy/tcp-cloud.auth.strategy';

@Module({
  imports: [CloudSessionModule],
  providers: [
    GoogleIdpCloudAuthStrategy,
    GithubIdpCloudAuthStrategy,
    SsoIdpCloudAuthStrategy,
    CloudAuthService,
    CloudAuthAnalytics,
    ...(process.env.NODE_ENV === 'development' ? [TcpCloudAuthStrategy] : [])
  ],
  controllers: [CloudAuthController],
  exports: [
    CloudAuthService,
    ...(process.env.NODE_ENV === 'development' ? [TcpCloudAuthStrategy] : [])
  ],
})
export class CloudAuthModule { }
