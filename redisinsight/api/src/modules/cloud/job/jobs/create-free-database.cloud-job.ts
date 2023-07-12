import { CloudJob, CloudJobOptions, WaitForTaskCloudJob } from 'src/modules/cloud/job/jobs';
import { CloudTaskCapiService } from 'src/modules/cloud/task/cloud-task.capi.service';
import { CloudCapiAuthDto } from 'src/modules/cloud/common/dto';
import {
  CloudSubscription,
} from 'src/modules/cloud/subscription/models';
import { CloudSubscriptionCapiService } from 'src/modules/cloud/subscription/cloud-subscription.capi.service';
import { CloudDatabase, CloudDatabaseStatus } from 'src/modules/cloud/database/models';
import { CreateFreeSubscriptionCloudJob } from 'src/modules/cloud/job/jobs/create-free-subscription.cloud-job';
import { CloudDatabaseCapiService } from 'src/modules/cloud/database/cloud-database.capi.service';
import { WaitForActiveDatabaseCloudJob } from 'src/modules/cloud/job/jobs/wait-for-active-database.cloud-job';
import { CloudJobName } from 'src/modules/cloud/job/constants';
import { CloudJobStatus } from 'src/modules/cloud/job/models';
import {
  CloudDatabaseAlreadyExistsFreeException, CloudJobUnexpectedErrorException,
  CloudTaskNoResourceIdException,
} from 'src/modules/cloud/job/exceptions';
import { DatabaseService } from 'src/modules/database/database.service';
import { HostingProvider } from 'src/modules/database/entities/database.entity';
import { Database } from 'src/modules/database/models/database';
import config from 'src/utils/config';
import { CloudDatabaseAnalytics } from 'src/modules/cloud/database/cloud-database.analytics';

const cloudConfig = config.get('cloud');

export class CreateFreeDatabaseCloudJob extends CloudJob {
  protected name = CloudJobName.CreateFreeDatabase;

  constructor(
    readonly options: CloudJobOptions,
    private readonly data: {
      capiCredentials: CloudCapiAuthDto,
    },
    protected readonly dependencies: {
      cloudDatabaseCapiService: CloudDatabaseCapiService,
      cloudSubscriptionCapiService: CloudSubscriptionCapiService,
      cloudTaskCapiService: CloudTaskCapiService,
      cloudDatabaseAnalytics: CloudDatabaseAnalytics,
      databaseService: DatabaseService,
    },
  ) {
    super(options);
  }

  async iteration(): Promise<Database> {
    try {
      this.logger.log('Create free database');

      this.checkSignal();

      this.logger.debug('Get or create free subscription');

      const freeSubscription: CloudSubscription = await this.runChildJob(
        CreateFreeSubscriptionCloudJob,
        this.data,
      );

      this.logger.debug('Get free subscription databases');

      this.checkSignal();

      const databases = await this.dependencies.cloudDatabaseCapiService.getDatabases(
        this.data.capiCredentials,
        {
          subscriptionId: freeSubscription.id,
          subscriptionType: freeSubscription.type,
        },
      );

      let cloudDatabase: CloudDatabase;

      if (databases?.length) {
        [cloudDatabase] = databases;

        if (cloudDatabase.status !== CloudDatabaseStatus.Pending
          && cloudDatabase.status !== CloudDatabaseStatus.Draft) {
          throw new CloudDatabaseAlreadyExistsFreeException();
        }
      } else {
        // create free database
        this.logger.debug('No free databases found. Create one...');

        this.checkSignal();

        let createFreeDatabaseTask = await this.dependencies.cloudDatabaseCapiService.createFreeDatabase(
          this.data.capiCredentials,
          {
            subscriptionId: freeSubscription.id,
            subscriptionType: freeSubscription.type,
          },
        );

        this.checkSignal();

        createFreeDatabaseTask = await this.runChildJob(
          WaitForTaskCloudJob,
          {
            taskId: createFreeDatabaseTask.taskId,
            capiCredentials: this.data.capiCredentials,
          },
        );

        const freeDatabaseId = createFreeDatabaseTask?.response?.resourceId;

        if (!freeDatabaseId) {
          throw new CloudTaskNoResourceIdException();
        }

        cloudDatabase = {
          databaseId: freeDatabaseId,
        } as CloudDatabase;
      }

      if (!cloudDatabase) {
        throw new CloudJobUnexpectedErrorException('Unable to determine or create free cloud database');
      }

      this.checkSignal();

      cloudDatabase = await this.runChildJob(
        WaitForActiveDatabaseCloudJob,
        {
          databaseId: cloudDatabase.databaseId,
          subscriptionId: freeSubscription.id,
          subscriptionType: freeSubscription.type,
          capiCredentials: this.data.capiCredentials,
        },
      );

      this.checkSignal();

      const {
        publicEndpoint,
        name,
        password,
      } = cloudDatabase;

      const [host, port] = publicEndpoint.split(':');

      const database = await this.dependencies.databaseService.create({
        host,
        port: parseInt(port, 10),
        name,
        nameFromProvider: name,
        password,
        provider: HostingProvider.RE_CLOUD,
        cloudDetails: {
          ...cloudDatabase?.cloudDetails,
          free: true,
        },
        timeout: cloudConfig.cloudDatabaseConnectionTimeout,
      });

      this.result = { resourceId: database.id };

      this.changeState({ status: CloudJobStatus.Finished });

      this.dependencies.cloudDatabaseAnalytics.sendCloudFreeDatabaseCreated();

      return database;
    } catch (e) {
      this.dependencies.cloudDatabaseAnalytics.sendCloudFreeDatabaseFailed(e);

      throw e;
    }
  }
}
