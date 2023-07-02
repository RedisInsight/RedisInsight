import { Injectable, Logger } from '@nestjs/common';
import { CloudSubscriptionApiService } from 'src/modules/cloud/subscription/cloud-subscription.api.service';
import { CloudAuthDto } from 'src/modules/cloud/autodiscovery/dto';
import {
  CloudSubscription,
  CloudSubscriptionType,
} from 'src/modules/cloud/autodiscovery/models';
import { parseCloudSubscriptionsResponse } from 'src/modules/cloud/autodiscovery/utils/redis-cloud-converter';
import { wrapHttpError } from 'src/common/utils';

@Injectable()
export class CloudSubscriptionService {
  private logger = new Logger('CloudSubscriptionService');

  constructor(
    private readonly api: CloudSubscriptionApiService,
  ) {}

  /**
   * Get list of account subscriptions based on type
   * @param authDto
   * @param type
   */
  async getSubscriptionsByType(authDto: CloudAuthDto, type: CloudSubscriptionType): Promise<CloudSubscription[]> {
    this.logger.log(`Getting cloud ${type} subscriptions.`);
    try {
      const subscriptions = await this.api.getSubscriptionsByType(authDto, type);
      this.logger.log(`Succeed to get cloud ${type} subscriptions.`);
      return parseCloudSubscriptionsResponse(subscriptions, type);
    } catch (e) {
      this.logger.error(`Unable to get ${type} subscriptions`, e);
      throw wrapHttpError(e);
    }
  }
}
