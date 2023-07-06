import { Injectable } from '@nestjs/common';
import {
  CloudSubscriptionType,
  ICloudCapiSubscription,
} from 'src/modules/cloud/subscription/models';
import { wrapCloudApiError } from 'src/modules/cloud/common/exceptions';
import { CloudCapiProvider } from 'src/modules/cloud/common/providers/cloud.capi.provider';
import { ICloudCapiCredentials } from 'src/modules/cloud/common/models';

@Injectable()
export class CloudSubscriptionCapiProvider extends CloudCapiProvider {
  /**
   * Get list of account subscriptions based on type
   * @param credentials
   * @param type
   */
  async getSubscriptionsByType(
    credentials: ICloudCapiCredentials,
    type: CloudSubscriptionType,
  ): Promise<ICloudCapiSubscription[]> {
    try {
      const { data } = await this.api.get(
        `${CloudCapiProvider.getPrefix(type)}/subscriptions`,
        CloudCapiProvider.getHeaders(credentials),
      );

      return data?.subscriptions;
    } catch (error) {
      throw wrapCloudApiError(error);
    }
  }

  /**
   * Create free subscription
   * @param credentials
   */
  async createFreeSubscription(credentials: ICloudCapiCredentials): Promise<ICloudCapiSubscription> {
    try {
      const { data } = await this.api.post(
        `${CloudCapiProvider.getPrefix(CloudSubscriptionType.Fixed)}/subscriptions`,
        {},
        CloudCapiProvider.getHeaders(credentials),
      );

      return data.subscription;
    } catch (error) {
      throw wrapCloudApiError(error);
    }
  }
}
