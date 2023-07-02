import { Module } from '@nestjs/common';
import { CloudSessionModule } from 'src/modules/cloud/session/cloud-session.module';
import { CloudSubscriptionModule } from 'src/modules/cloud/subscription/cloud-subscription.module';
import { CloudUserService } from 'src/modules/cloud/user/cloud-user.service';
import { CloudUserRepository } from 'src/modules/cloud/user/repositories/cloud-user.repository';
import { InSessionCloudUserRepository } from 'src/modules/cloud/user/repositories/in-session.cloud-user.repository';
import { CloudUserController } from 'src/modules/cloud/user/cloud-user.controller';
import { CloudUserApiService } from 'src/modules/cloud/user/cloud-user.api.service';

@Module({})
export class CloudUserModule {
  static register() {
    return {
      module: CloudUserModule,
      imports: [CloudSessionModule, CloudSubscriptionModule],
      providers: [
        CloudUserApiService,
        CloudUserService,
        {
          provide: CloudUserRepository,
          useClass: InSessionCloudUserRepository,
        },
      ],
      controllers: [CloudUserController],
    };
  }
}
