import { Injectable } from '@nestjs/common';
import { CloudJob } from 'src/modules/cloud/job/jobs';
import { CloudJobName } from 'src/modules/cloud/job/constants';
import { CreateFreeDatabaseCloudJob } from 'src/modules/cloud/job/jobs/create-free-database.cloud-job';
import { CloudDatabaseCapiService } from 'src/modules/cloud/database/cloud-database.capi.service';
import { CloudSubscriptionCapiService } from 'src/modules/cloud/subscription/cloud-subscription.capi.service';
import { CloudTaskCapiService } from 'src/modules/cloud/task/cloud-task.capi.service';
import { CloudCapiAuthDto } from 'src/modules/cloud/common/dto';
import { CloudJobUnsupportedException } from 'src/modules/cloud/job/exceptions';
import { SessionMetadata } from 'src/common/models';
import { DatabaseService } from 'src/modules/database/database.service';

@Injectable()
export class CloudJobFactory {
  constructor(
    private readonly cloudDatabaseCapiService: CloudDatabaseCapiService,
    private readonly cloudSubscriptionCapiService: CloudSubscriptionCapiService,
    private readonly cloudTaskCapiService: CloudTaskCapiService,
    private readonly databaseService: DatabaseService,
  ) {}

  async create(
    name: CloudJobName,
    data: any,
    options: {
      sessionMetadata: SessionMetadata,
      capiCredentials?: CloudCapiAuthDto,
      stateCallback?: (self: CloudJob) => any,
    },
  ): Promise<CloudJob> {
    switch (name) {
      case CloudJobName.CreateFreeDatabase:
        return new CreateFreeDatabaseCloudJob(
          {
            abortController: new AbortController(),
            ...options,
          },
          data,
          {
            cloudDatabaseCapiService: this.cloudDatabaseCapiService,
            cloudSubscriptionCapiService: this.cloudSubscriptionCapiService,
            cloudTaskCapiService: this.cloudTaskCapiService,
            databaseService: this.databaseService,
          },
        );
      default:
        throw new CloudJobUnsupportedException();
    }
  }
}
