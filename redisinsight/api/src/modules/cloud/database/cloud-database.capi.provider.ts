import { Injectable } from '@nestjs/common';
import { CloudCapiProvider } from 'src/modules/cloud/common/providers/cloud.capi.provider';
import { ICloudCapiDatabase, ICloudCapiSubscriptionDatabases } from 'src/modules/cloud/database/models';
import { ICloudCapiCredentials } from 'src/modules/cloud/common/models';
import { GetCloudSubscriptionDatabaseDto, GetCloudSubscriptionDatabasesDto } from 'src/modules/cloud/database/dto';
import { wrapCloudCapiError } from 'src/modules/cloud/common/exceptions';

@Injectable()
export class CloudDatabaseCapiProvider extends CloudCapiProvider {
  /**
   * Get single database details
   * @param credentials
   * @param dto
   */
  async getDatabase(
    credentials: ICloudCapiCredentials,
    dto: GetCloudSubscriptionDatabaseDto,
  ): Promise<ICloudCapiDatabase> {
    try {
      const { subscriptionId, databaseId, subscriptionType } = dto;

      const { data } = await this.api.get(
        `${CloudCapiProvider.getPrefix(subscriptionType)}/subscriptions/${subscriptionId}/databases/${databaseId}`,
        CloudCapiProvider.getHeaders(credentials),
      );

      return data;
    } catch (e) {
      throw wrapCloudCapiError(e);
    }
  }

  /**
   * Get list of databases for subscription
   * @param credentials
   * @param dto
   */
  async getDatabases(
    credentials: ICloudCapiCredentials,
    dto: GetCloudSubscriptionDatabasesDto,
  ): Promise<ICloudCapiSubscriptionDatabases> {
    try {
      const { subscriptionId, subscriptionType } = dto;

      const { data } = await this.api.get(
        `${CloudCapiProvider.getPrefix(subscriptionType)}/subscriptions/${subscriptionId}/databases`,
        CloudCapiProvider.getHeaders(credentials),
      );

      return data;
    } catch (e) {
      throw wrapCloudCapiError(e);
    }
  }
}
