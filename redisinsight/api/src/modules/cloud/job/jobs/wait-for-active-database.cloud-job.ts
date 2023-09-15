import { CloudJob, CloudJobOptions } from 'src/modules/cloud/job/jobs/cloud-job';
import { CloudCapiAuthDto } from 'src/modules/cloud/common/dto';
import { CloudSubscriptionType } from 'src/modules/cloud/subscription/models';
import { CloudDatabaseCapiService } from 'src/modules/cloud/database/cloud-database.capi.service';
import { CloudDatabase, CloudDatabaseStatus } from 'src/modules/cloud/database/models';
import { CloudJobStatus } from 'src/modules/cloud/job/models';
import {
  CloudDatabaseInFailedStateException,
  CloudDatabaseInUnexpectedStateException,
} from 'src/modules/cloud/job/exceptions';
import { CloudJobName } from 'src/modules/cloud/job/constants';

export class WaitForActiveDatabaseCloudJob extends CloudJob {
  protected name = CloudJobName.WaitForActiveDatabase;

  constructor(
    readonly options: CloudJobOptions,
    private readonly data: {
      databaseId: number,
      subscriptionId: number,
      subscriptionType: CloudSubscriptionType,
    },
    protected readonly dependencies: {
      cloudDatabaseCapiService: CloudDatabaseCapiService,
    },
  ) {
    super(options);
  }

  async iteration(): Promise<CloudDatabase> {
    this.logger.log('Waiting for cloud database active state');

    this.checkSignal();

    this.logger.debug('Fetching cloud database');

    const database = await this.dependencies.cloudDatabaseCapiService.getDatabase(
      this.options.capiCredentials,
      {
        subscriptionId: this.data.subscriptionId,
        subscriptionType: this.data.subscriptionType,
        databaseId: this.data.databaseId,
      },
    );

    switch (database?.status) {
      case CloudDatabaseStatus.Active:
        this.logger.debug('Cloud database is in the active states');

        this.changeState({ status: CloudJobStatus.Finished });

        return database;
      case CloudDatabaseStatus.ImportPending:
      case CloudDatabaseStatus.ActiveChangePending:
      case CloudDatabaseStatus.Pending:
      case CloudDatabaseStatus.Draft:
        this.logger.debug('Cloud database is not in the active state. Scheduling new iteration');

        return await this.runNextIteration();
      case CloudDatabaseStatus.CreationFailed:
        throw new CloudDatabaseInFailedStateException();
      case CloudDatabaseStatus.DeletePending:
      case CloudDatabaseStatus.Recovery:
      default:
        throw new CloudDatabaseInUnexpectedStateException();
    }
  }
}
