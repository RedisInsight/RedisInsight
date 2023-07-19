import { filter, find } from 'lodash';
import { Injectable, Logger } from '@nestjs/common';
import { SessionMetadata } from 'src/common/models';
import { wrapHttpError } from 'src/common/utils';
import { CloudRequestUtm, ICloudApiCredentials } from 'src/modules/cloud/common/models';
import { CloudSubscriptionCapiService } from './cloud-subscription.capi.service';
import { CloudUserApiService } from '../user/cloud-user.api.service';
import { CloudSubscriptionRegion, CloudSubscriptionType } from './models';
import { CloudSessionService } from '../session/cloud-session.service';
import { parseCloudSubscriptionsCloudRegionsApiResponse } from './utils';
import { CloudSubscriptionApiProvider } from './providers/cloud-subscription.api.provider';
import { CloudSubscriptionPlanResponse } from './dto';

@Injectable()
export class CloudSubscriptionApiService {
  private logger = new Logger('CloudSubscriptionApiService');

  constructor(
    private readonly api: CloudSubscriptionApiProvider,
    private readonly sessionService: CloudSessionService,
    private readonly cloudUserApiService: CloudUserApiService,
    private readonly cloudSubscriptionCapiService: CloudSubscriptionCapiService,
  ) {}

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
          await this.cloudUserApiService.getCapiKeys(sessionMetadata, utm),
          CloudSubscriptionType.Fixed,
        ),
        this.getCloudRegions(
          await this.sessionService.getSession(sessionMetadata.sessionId),
        ),
      ]);

      const freePlans = filter(
        fixedPlans,
        ({ price, name }) => price === 0 && name.startsWith('Cache')
      );

      return freePlans.map((plan) => ({
        ...plan,
        details: find(regions, { regionId: plan.regionId }),
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

      return parseCloudSubscriptionsCloudRegionsApiResponse(regions);
    } catch (error) {
      throw wrapHttpError(error);
    }
  }
}
