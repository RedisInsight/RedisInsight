import { CloudJob, CloudJobOptions } from 'src/modules/cloud/job/jobs/cloud-job';
import { CloudCapiAuthDto } from 'src/modules/cloud/common/dto';
import { CloudSubscriptionCapiService } from 'src/modules/cloud/subscription/cloud-subscription.capi.service';
import {
  CloudSubscription,
  CloudSubscriptionStatus,
  CloudSubscriptionType,
} from 'src/modules/cloud/subscription/models';
import { CloudJobStatus } from 'src/modules/cloud/job/models';
import {
  CloudSubscriptionInFailedStateException,
  CloudSubscriptionInUnexpectedStateException,
} from 'src/modules/cloud/job/exceptions';
import { CloudJobName } from 'src/modules/cloud/job/constants';

export class WaitForActiveSubscriptionCloudJob extends CloudJob {
  protected name = CloudJobName.WaitForActiveSubscription;

  constructor(
    readonly options: CloudJobOptions,
    private readonly data: {
      subscriptionId: number,
      subscriptionType: CloudSubscriptionType,
    },
    protected readonly dependencies: {
      cloudSubscriptionCapiService: CloudSubscriptionCapiService,
    },
  ) {
    super(options);
  }

  async iteration(): Promise<CloudSubscription> {
    this.logger.log('Waiting for cloud subscription active state');

    this.checkSignal();

    this.logger.debug('Fetching cloud subscription');

    const subscription = await this.dependencies.cloudSubscriptionCapiService.getSubscription(
      this.options.capiCredentials,
      this.data.subscriptionId,
      this.data.subscriptionType,
    );

    switch (subscription?.status) {
      case CloudSubscriptionStatus.Active:
        this.logger.debug('Cloud subscription is in the active states');

        this.changeState({ status: CloudJobStatus.Finished });

        return subscription;
      case CloudSubscriptionStatus.Pending:
      case CloudSubscriptionStatus.NotActivated:
        this.logger.debug('Cloud subscription is not in the active state. Scheduling new iteration');

        return await this.runNextIteration();
      case CloudSubscriptionStatus.Error:
        this.logger.debug('Cloud subscription is in the failed state');

        throw new CloudSubscriptionInFailedStateException();
      case CloudSubscriptionStatus.Deleting:
      default:

        throw new CloudSubscriptionInUnexpectedStateException();
    }
  }
}
