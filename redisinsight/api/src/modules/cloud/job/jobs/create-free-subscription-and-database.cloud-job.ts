import { CloudJob, CloudJobOptions, CreateFreeDatabaseCloudJob } from 'src/modules/cloud/job/jobs';
import { CloudTaskCapiService } from 'src/modules/cloud/task/cloud-task.capi.service';
import { CloudSubscriptionCapiService } from 'src/modules/cloud/subscription/cloud-subscription.capi.service';
import { CreateFreeSubscriptionCloudJob } from 'src/modules/cloud/job/jobs/create-free-subscription.cloud-job';
import { CloudDatabaseCapiService } from 'src/modules/cloud/database/cloud-database.capi.service';
import { CloudJobName } from 'src/modules/cloud/job/constants';
import { CloudJobStatus, CloudJobStep } from 'src/modules/cloud/job/models';
import { DatabaseService } from 'src/modules/database/database.service';
import { Database } from 'src/modules/database/models/database';
import { CloudDatabaseAnalytics } from 'src/modules/cloud/database/cloud-database.analytics';
import { CloudCapiKeyService } from 'src/modules/cloud/capi-key/cloud-capi-key.service';
import { CloudSubscription } from 'src/modules/cloud/subscription/models';

export class CreateFreeSubscriptionAndDatabaseCloudJob extends CloudJob {
  protected name = CloudJobName.CreateFreeDatabase;

  constructor(
    readonly options: CloudJobOptions,

    private readonly data: {
      planId: number,
    },

    protected readonly dependencies: {
      cloudDatabaseCapiService: CloudDatabaseCapiService,
      cloudSubscriptionCapiService: CloudSubscriptionCapiService,
      cloudTaskCapiService: CloudTaskCapiService,
      cloudDatabaseAnalytics: CloudDatabaseAnalytics,
      databaseService: DatabaseService,
      cloudCapiKeyService: CloudCapiKeyService,
    },
  ) {
    super(options);
  }

  async iteration(): Promise<Database> {
    this.logger.log('Create free subscription and database');

    this.checkSignal();

    this.changeState({ step: CloudJobStep.Subscription });

    this.logger.debug('Get or create free subscription');

    const freeSubscription: CloudSubscription = await this.runChildJob(
      CreateFreeSubscriptionCloudJob,
      this.data,
      this.options,
    );

    this.logger.debug('Get free subscription databases');

    this.checkSignal();

    this.changeState({ step: CloudJobStep.Database });

    const database = await this.runChildJob(
      CreateFreeDatabaseCloudJob,
      {
        subscriptionId: freeSubscription.id,
      },
      this.options,
    );

    this.result = { resourceId: database.id };

    this.changeState({ status: CloudJobStatus.Finished });

    return database;
  }
}
