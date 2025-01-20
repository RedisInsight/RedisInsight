import { Module } from '@nestjs/common';
import { CloudAutodiscoveryModule } from 'src/modules/cloud/autodiscovery/cloud.autodiscovery.module';
import { CloudAuthModule } from 'src/modules/cloud/auth/cloud-auth.module';
import { CloudOauthModule } from 'src/modules/cloud/oauth/cloud-oauth.module';
import { CloudTaskModule } from 'src/modules/cloud/task/cloud-task.module';
import { CloudJobModule } from 'src/modules/cloud/job/cloud-job.module';
import { CloudCapiKeyModule } from 'src/modules/cloud/capi-key/cloud-capi-key.module';
import { CloudUserModule } from 'src/modules/cloud/user/cloud-user.module';
import { LocalCloudUserRepository } from 'src/modules/cloud/user/repositories/local.cloud-user.repository';
import { CloudSessionModule } from './session/cloud-session.module';

@Module({})
export class CloudModule {
  static register() {
    return {
      module: CloudModule,
      imports: [
        CloudSessionModule.register(),
        CloudAuthModule,
        CloudOauthModule,
        CloudUserModule.register(LocalCloudUserRepository),
        CloudAutodiscoveryModule,
        CloudTaskModule,
        CloudJobModule,
        CloudCapiKeyModule,
      ],
    };
  }
}
