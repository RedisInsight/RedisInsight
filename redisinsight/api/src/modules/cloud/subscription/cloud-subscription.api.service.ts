import { Injectable } from '@nestjs/common';
import { CloudAuthDto } from 'src/modules/cloud/autodiscovery/dto';
import axios from 'axios';
import config from 'src/utils/config';
import {
  CloudSubscriptionType,
  ICloudApiSubscription,
} from 'src/modules/cloud/autodiscovery/models';
import { wrapCloudApiError } from 'src/modules/cloud/common/exceptions';

const redisCloudConfig = config.get('redis_cloud');

@Injectable()
export class CloudSubscriptionApiService {
  private api = axios.create({
    baseURL: redisCloudConfig.url,
  });

  /**
   * Get api base for fixed subscriptions
   * @param type
   * @private
   */
  static getPrefix(type?: CloudSubscriptionType): string {
    return `${type === CloudSubscriptionType.Fixed ? '/fixed' : ''}`;
  }

  /**
   * Generates auth headers to attach to the request
   * @param apiKey
   * @param apiSecret
   * @private
   */
  static getAuthHeaders({ apiKey, apiSecret }: CloudAuthDto) {
    return {
      headers: {
        'x-api-key': apiKey,
        'x-api-secret-key': apiSecret,
      },
    };
  }

  /**
   * Get list of account subscriptions based on type
   * @param authDto
   * @param type
   */
  async getSubscriptionsByType(authDto: CloudAuthDto, type: CloudSubscriptionType): Promise<ICloudApiSubscription[]> {
    try {
      const { data } = await this.api.get(
        `${CloudSubscriptionApiService.getPrefix(type)}/subscriptions`,
        CloudSubscriptionApiService.getAuthHeaders(authDto),
      );

      return data?.subscriptions;
    } catch (error) {
      throw wrapCloudApiError(error);
    }
  }

  /**
   * Create free subscription
   * @param authDto
   */
  async createFreeSubscription(authDto: CloudAuthDto): Promise<ICloudApiSubscription> {
    try {
      const { data } = await this.api.post(
        `${CloudSubscriptionApiService.getPrefix(CloudSubscriptionType.Fixed)}/subscriptions`,
        {},
        CloudSubscriptionApiService.getAuthHeaders(authDto),
      );

      return data.subscription;
    } catch (error) {
      throw wrapCloudApiError(error);
    }
  }
}
