import { Module } from '@nestjs/common';
import { CloudTaskModule } from 'src/modules/cloud/task/cloud-task.module';
import { CloudJobController } from 'src/modules/cloud/job/cloud-job.controller';
import { CloudJobService } from 'src/modules/cloud/job/cloud-job.service';
import { CloudSubscriptionModule } from 'src/modules/cloud/subscription/cloud-subscription.module';
import { CloudDatabaseModule } from 'src/modules/cloud/database/cloud-database.module';
import { CloudUserModule } from 'src/modules/cloud/user/cloud-user.module';
import { CloudJobFactory } from 'src/modules/cloud/job/cloud-job.factory';
import { CloudJobProvider } from 'src/modules/cloud/job/cloud-job.provider';

@Module({
  imports: [
    CloudTaskModule,
    CloudSubscriptionModule,
    CloudDatabaseModule,
    CloudUserModule,
  ],
  providers: [
    CloudJobService,
    CloudJobFactory,
    CloudJobProvider,
  ],
  controllers: [CloudJobController],
})
export class CloudJobModule {}
