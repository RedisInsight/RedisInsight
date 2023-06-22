import { Module } from '@nestjs/common';
import { CloudAutodiscoveryModule } from 'src/modules/cloud/autodiscovery/cloud.autodiscovery.module';

@Module({})
export class CloudModule {
  static register() {
    return {
      module: CloudModule,
      imports: [CloudAutodiscoveryModule],
    };
  }
}
