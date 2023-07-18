import { filter, find } from 'lodash';
import { Injectable, Logger } from '@nestjs/common';
import { SessionMetadata } from 'src/common/models';
import { wrapHttpError } from 'src/common/utils';
import { CloudCapiAuthDto } from 'src/modules/cloud/common/dto';
import { CloudRequestUtm, ICloudApiCredentials } from 'src/modules/cloud/common/models';
import { CloudSubscriptionPlanResponse } from './models/api.interface';
import { CloudSubscriptionCapiService } from './cloud-subscription.capi.service';
import { CloudUserApiService } from '../user/cloud-user.api.service';
import { CloudSubscriptionRegion, CloudSubscriptionType } from './models';
import { CloudSessionService } from '../session/cloud-session.service';
import { parseCloudSubscriptionsCloudRegionsCapiResponse } from './utils';
import { CloudSession } from '../session/models/cloud-session';
import { CloudSubscriptionApiProvider } from './providers/cloud-subscription.api.provider';

@Injectable()
export class CloudSubscriptionApiService {
  private logger = new Logger('CloudSubscriptionApiService');

  constructor(
    private readonly api: CloudSubscriptionApiProvider,
    private readonly sessionService: CloudSessionService,
    private readonly cloudUserApiService: CloudUserApiService,
    private readonly cloudSubscriptionCapiService: CloudSubscriptionCapiService,
  ) {}

  private async getApiCredentials(sessionId: string): Promise<CloudSession> {
    return this.sessionService.getSession(sessionId);
  }

  private async getCapiCredentials(sessionMetadata: SessionMetadata, utm?: CloudRequestUtm): Promise<CloudCapiAuthDto> {
    return this.cloudUserApiService.getCapiKeys(sessionMetadata, utm);
  }

  /**
   * Get list of subscription plans and cloud regions
   * @param sessionMetadata
   * @param utm
   */
  async getSubscriptionPlans(
    sessionMetadata: SessionMetadata,
    utm?: CloudRequestUtm,
  ): Promise<CloudSubscriptionPlanResponse[]> {
    try {
      const [fixedPlans, regions] = await Promise.all([
        this.cloudSubscriptionCapiService.getSubscriptionsPlans(
          await this.getCapiCredentials(sessionMetadata, utm),
          CloudSubscriptionType.Fixed,
        ),
        this.getCloudRegions(
          await this.getApiCredentials(sessionMetadata.sessionId),
        ),
      ]);

      const freePlans = filter(fixedPlans, { price: 0 });

      return freePlans.map((plan) => ({
        ...plan,
        details: find(regions, { name: plan.region }),
      }));
    } catch (e) {
      // todo: error
      throw wrapHttpError(e);
    }
  }

  /**
   * Get list of cloud regions
   * @param credentials
   */
  async getCloudRegions(
    credentials: ICloudApiCredentials,
  ): Promise<CloudSubscriptionRegion[]> {
    this.logger.log('Getting cloud regions.');
    try {
      const regions = await this.api.getCloudRegions(credentials);

      this.logger.log('Succeed to get cloud regions');

      return parseCloudSubscriptionsCloudRegionsCapiResponse(regions);
    } catch (error) {
      throw wrapHttpError(error);
    }
  }
}
