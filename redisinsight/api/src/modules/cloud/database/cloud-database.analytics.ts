import { HttpException, Injectable } from '@nestjs/common';
import { TelemetryBaseService } from 'src/modules/analytics/telemetry.base.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TelemetryEvents } from 'src/constants';
import { CloudSubscriptionCapiService } from '../subscription/cloud-subscription.capi.service';
import { CloudSubscriptionType } from '../subscription/models';
import { CloudCapiAuthDto } from '../common/dto';
import { catchAclError } from 'src/utils';

@Injectable()
export class CloudDatabaseAnalytics extends TelemetryBaseService {
  constructor(protected eventEmitter: EventEmitter2) {
    super(eventEmitter);
  }

  sendCloudFreeDatabaseCreated(eventData: object = {}) {
    this.sendEvent(TelemetryEvents.CloudFreeDatabaseCreated, eventData);
  }

  async sendCloudFreeDatabaseFailed(
    exception: HttpException,
    eventData: object = {},
    cloudSubscriptionCapiService: CloudSubscriptionCapiService,
    data: { planId: number, capiCredentials: CloudCapiAuthDto },
  ) {
    try {
      const fixedPlans = await cloudSubscriptionCapiService.getSubscriptionsPlans(
        data.capiCredentials,
        CloudSubscriptionType.Fixed,
      );

      const selectedPlan = CloudSubscriptionCapiService.findFreePlanById(fixedPlans, data.planId);

      this.sendFailedEvent(
        TelemetryEvents.CloudFreeDatabaseFailed,
        exception,
        {
          region: selectedPlan?.region || '',
          provider: selectedPlan?.provider || '',
          ...eventData,
        },
      );
    } catch (error) {
    }
  }
}
