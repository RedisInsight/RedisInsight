import { CloudJob, CloudJobOptions } from 'src/modules/cloud/job/jobs/cloud-job';
import { CloudTaskCapiService } from 'src/modules/cloud/task/cloud-task.capi.service';
import { CloudCapiAuthDto } from 'src/modules/cloud/common/dto';
import {
  CloudSubscription,
  CloudSubscriptionStatus,
  CloudSubscriptionType,
} from 'src/modules/cloud/subscription/models';
import { CloudSubscriptionCapiService } from 'src/modules/cloud/subscription/cloud-subscription.capi.service';
import { WaitForTaskCloudJob } from 'src/modules/cloud/job/jobs/wait-for-task.cloud-job';
import { WaitForActiveSubscriptionCloudJob } from 'src/modules/cloud/job/jobs/wait-for-active-subscription.cloud-job';
import { CloudJobName } from 'src/modules/cloud/job/constants';
import { CloudJobStatus } from 'src/modules/cloud/job/models';
import {
  CloudPlanNotFoundFreeException,
  CloudSubscriptionUnableToDetermineException,
  CloudTaskNoResourceIdException,
} from 'src/modules/cloud/job/exceptions';

export class CreateFreeSubscriptionCloudJob extends CloudJob {
  protected name = CloudJobName.CreateFreeSubscription;

  constructor(
    readonly options: CloudJobOptions,
    private readonly data: {
      capiCredentials: CloudCapiAuthDto,
    },
    protected readonly dependencies: {
      cloudSubscriptionCapiService: CloudSubscriptionCapiService,
      cloudTaskCapiService: CloudTaskCapiService,
    },
  ) {
    super(options);
  }

  async iteration(): Promise<CloudSubscription> {
    this.logger.log('Ensure free cloud subscription');

    this.checkSignal();

    let freeSubscription: CloudSubscription;

    this.logger.debug('Fetching fixed subscriptions');

    const fixedSubscriptions = await this.dependencies.cloudSubscriptionCapiService.getSubscriptions(
      this.data.capiCredentials,
      CloudSubscriptionType.Fixed,
    );

    freeSubscription = CloudSubscriptionCapiService.findFreeSubscription(fixedSubscriptions);

    // in case when no free subscriptions found we must create one
    if (!freeSubscription) {
      this.logger.debug('No free subscription found. Creating one');
      this.checkSignal();
      this.logger.debug('Fetching free plans');

      // Get available fixed plans
      const fixedPlans = await this.dependencies.cloudSubscriptionCapiService.getSubscriptionsPlans(
        this.data.capiCredentials,
        CloudSubscriptionType.Fixed,
      );

      const freePlan = CloudSubscriptionCapiService.findFreePlan(fixedPlans);

      if (!freePlan) {
        throw new CloudPlanNotFoundFreeException();
      }

      this.logger.debug('Create free subscription');
      this.checkSignal();

      let createSubscriptionTask = await this.dependencies.cloudSubscriptionCapiService.createFreeSubscription(
        this.data.capiCredentials,
        freePlan.id,
      );

      this.logger.debug('Create free subscription: cloud task created. Waiting...');
      this.checkSignal();

      createSubscriptionTask = await this.runChildJob(
        WaitForTaskCloudJob,
        {
          taskId: createSubscriptionTask.taskId,
          capiCredentials: this.data.capiCredentials,
        },
      );

      const freeSubscriptionId = createSubscriptionTask?.response?.resourceId;

      if (!freeSubscriptionId) {
        throw new CloudTaskNoResourceIdException();
      }

      freeSubscription = {
        id: freeSubscriptionId,
      } as CloudSubscription;
    }

    if (!freeSubscription) {
      throw new CloudSubscriptionUnableToDetermineException();
    }

    this.checkSignal();

    if (freeSubscription.status !== CloudSubscriptionStatus.Active) {
      freeSubscription = await this.runChildJob(
        WaitForActiveSubscriptionCloudJob,
        {
          capiCredentials: this.data.capiCredentials,
          subscriptionId: freeSubscription.id,
          subscriptionType: CloudSubscriptionType.Fixed,
        },
      );
    }

    this.changeState({ status: CloudJobStatus.Finished });

    return freeSubscription;
  }
}
