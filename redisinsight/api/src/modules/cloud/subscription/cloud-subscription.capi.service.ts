import { Injectable, Logger } from '@nestjs/common';
import {
  CloudSubscription,
  CloudSubscriptionType,
} from 'src/modules/cloud/subscription/models';
import { wrapHttpError } from 'src/common/utils';
import { CloudCapiAuthDto } from 'src/modules/cloud/common/dto';
import { CloudSubscriptionCapiProvider } from 'src/modules/cloud/subscription/cloud-subscription.capi.provider';
import { parseCloudSubscriptionsCapiResponse } from 'src/modules/cloud/subscription/utils';

@Injectable()
export class CloudSubscriptionCapiService {
  private logger = new Logger('CloudSubscriptionCapiService');

  constructor(
    private readonly capi: CloudSubscriptionCapiProvider,
  ) {}

  /**
   * Get list of account subscriptions
   * @param authDto
   * @param type
   */
  async getSubscriptions(
    authDto: CloudCapiAuthDto,
    type: CloudSubscriptionType,
  ): Promise<CloudSubscription[]> {
    this.logger.log(`Getting cloud ${type} subscriptions.`);
    try {
      const subscriptions = await this.capi.getSubscriptionsByType(authDto, type);

      this.logger.log('Succeed to get cloud flexible subscriptions.');

      return parseCloudSubscriptionsCapiResponse(subscriptions, type);
    } catch (error) {
      throw wrapHttpError(error);
    }
  }
}
