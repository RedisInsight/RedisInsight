import { Module } from '@nestjs/common';
import { CloudAutodiscoveryModule } from 'src/modules/cloud/autodiscovery/cloud.autodiscovery.module';
import { CloudAuthModule } from 'src/modules/cloud/auth/cloud-auth.module';
import { CloudUserModule } from 'src/modules/cloud/user/cloud-user.module';
import { CloudTaskModule } from 'src/modules/cloud/task/cloud-task.module';
import { CloudJobModule } from 'src/modules/cloud/job/cloud-job.module';
import { CloudCapiKeyModule } from 'src/modules/cloud/capi-key/cloud-capi-key.module';
import { CloudAuthService } from './auth/cloud-auth.service';
import { TcpCloudAuthStrategy } from './auth/auth-strategy/tcp-cloud.auth.strategy';
import { CloudAuthStrategy } from './auth/auth-strategy/cloud-auth.strategy';
import { CloudSessionService } from './session/cloud-session.service';
import { CloudAuthAnalytics } from './auth/cloud-auth.analytics';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { GoogleIdpCloudAuthStrategy } from './auth/auth-strategy/google-idp.cloud.auth-strategy';
import { GithubIdpCloudAuthStrategy } from './auth/auth-strategy/github-idp.cloud.auth-strategy';
import { SsoIdpCloudAuthStrategy } from './auth/auth-strategy/sso-idp.cloud.auth-strategy';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    CloudAutodiscoveryModule,
    CloudAuthModule,
    CloudUserModule,
    CloudTaskModule,
    CloudJobModule,
    CloudCapiKeyModule,
  ],
  providers: [
    // Services
    CloudAuthService,
    CloudSessionService,
    CloudAuthAnalytics,
    
    // Auth Strategies
    GoogleIdpCloudAuthStrategy,
    GithubIdpCloudAuthStrategy,
    SsoIdpCloudAuthStrategy,
    {
      provide: CloudAuthStrategy,
      useClass: TcpCloudAuthStrategy
    }
  ],
  exports: [
    CloudAuthService, 
    CloudAuthStrategy,
    // Export IDP strategies if needed by other modules
    GoogleIdpCloudAuthStrategy,
    GithubIdpCloudAuthStrategy,
    SsoIdpCloudAuthStrategy,
  ]
})
export class CloudModule {
  static register() {
    return {
      module: CloudModule,
      imports: [
        CloudAuthModule,
        CloudUserModule,
        CloudAutodiscoveryModule,
        CloudTaskModule,
        CloudJobModule,
        CloudCapiKeyModule,
      ],
    };
  }
}
