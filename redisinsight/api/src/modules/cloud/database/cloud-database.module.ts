import { Module } from '@nestjs/common';
import { CloudUserModule } from 'src/modules/cloud/user/cloud-user.module';
import { CloudDatabaseController } from 'src/modules/cloud/database/cloud-database.controller';
import { CloudDatabaseCapiProvider } from 'src/modules/cloud/database/cloud-database.capi.provider';
import { CloudDatabaseCapiService } from 'src/modules/cloud/database/cloud-database.capi.service';
import { CloudSessionModule } from 'src/modules/cloud/session/cloud-session.module';
import { CloudSubscriptionModule } from 'src/modules/cloud/subscription/cloud-subscription.module';

@Module({
  imports: [
    CloudUserModule,
    CloudSessionModule,
    CloudUserModule,
    CloudSubscriptionModule,
  ],
  providers: [
    CloudDatabaseCapiProvider,
    CloudDatabaseCapiService,
  ],
  controllers: [CloudDatabaseController],
  exports: [CloudDatabaseCapiService],
})
export class CloudDatabaseModule {}
