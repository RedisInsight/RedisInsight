import { Module, Type } from '@nestjs/common';
import { CloudUserRepository } from 'src/modules/cloud/user/repositories/cloud-user.repository';
import { CloudUserService } from 'src/modules/cloud/user/cloud-user.service';
import { LocalCloudUserRepository } from 'src/modules/cloud/user/repositories/local.cloud-user.repository';
import { CloudUserController } from './cloud-user.controller';

@Module({})
export class CloudUserModule {
  static register(cloudUserRepository: Type<CloudUserRepository> = LocalCloudUserRepository) {
    return {
      module: CloudUserModule,
      providers: [
        CloudUserService,
        {
          provide: CloudUserRepository,
          useClass: cloudUserRepository,
        },
      ],
      controllers: [CloudUserController],
    };
  }
}
