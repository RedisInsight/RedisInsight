import { Module } from '@nestjs/common';
import { CloudAutodiscoveryModule } from 'src/modules/cloud/autodiscovery/cloud.autodiscovery.module';
import { CloudAuthModule } from 'src/modules/cloud/auth/cloud-auth.module';
import { CloudUserModule } from 'src/modules/cloud/user/cloud-user.module';
import { CloudTaskModule } from 'src/modules/cloud/task/cloud-task.module';
import { CloudJobModule } from 'src/modules/cloud/job/cloud-job.module';

@Module({})
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
      ],
    };
  }
}
