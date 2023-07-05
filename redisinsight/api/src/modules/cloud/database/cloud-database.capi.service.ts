import { find, filter } from 'lodash';
import { Injectable, Logger } from '@nestjs/common';
import { SessionMetadata } from 'src/common/models';
import { wrapHttpError } from 'src/common/utils';
import { CloudCapiAuthDto } from 'src/modules/cloud/common/dto';
import { GetCloudSubscriptionDatabaseDto, GetCloudSubscriptionDatabasesDto } from 'src/modules/cloud/database/dto';
import { CloudDatabaseCapiProvider } from 'src/modules/cloud/database/cloud-database.capi.provider';
import { CloudDatabase } from 'src/modules/cloud/database/models';
import { parseCloudDatabaseCapiResponse, parseCloudDatabasesCapiResponse } from 'src/modules/cloud/database/utils';
import { CloudSessionService } from 'src/modules/cloud/session/cloud-session.service';
import { CloudSubscriptionCapiService } from 'src/modules/cloud/subscription/cloud-subscription.capi.service';
import { CloudUserApiService } from 'src/modules/cloud/user/cloud-user.api.service';
import { CloudSubscriptionType } from 'src/modules/cloud/subscription/models';
import config from 'src/utils/config';

const cloudConfig = config.get('cloud');

@Injectable()
export class CloudDatabaseCapiService {
  private logger = new Logger('CloudDatabaseCapiService');

  constructor(
    private readonly capi: CloudDatabaseCapiProvider,
    private readonly cloudSessionService: CloudSessionService,
    private readonly cloudSubscriptionCapiService: CloudSubscriptionCapiService,
    private readonly cloudUserApiService: CloudUserApiService,
  ) {}

  /**
   * Get single database details
   * @param authDto
   * @param dto
   */
  async getDatabase(
    authDto: CloudCapiAuthDto,
    dto: GetCloudSubscriptionDatabaseDto,
  ): Promise<CloudDatabase> {
    try {
      this.logger.log('Getting cloud database', dto);

      const database = await this.capi.getDatabase(authDto, dto);

      this.logger.log('Succeed to get databases in RE cloud subscription.');

      return parseCloudDatabaseCapiResponse(database, dto.subscriptionId, dto.subscriptionType);
    } catch (e) {
      this.logger.error('Failed to get cloud database', e);
      throw wrapHttpError(e);
    }
  }

  /**
   * Get list of databases from subscription
   * @param authDto
   * @param dto
   */
  async getDatabases(
    authDto: CloudCapiAuthDto,
    dto: GetCloudSubscriptionDatabasesDto,
  ): Promise<CloudDatabase[]> {
    try {
      this.logger.log('Getting cloud databases from subscription', dto);

      const data = await this.capi.getDatabases(authDto, dto);

      this.logger.log('Succeed to get cloud databases from subscription.');

      return parseCloudDatabasesCapiResponse(data, dto.subscriptionType);
    } catch (e) {
      throw wrapHttpError(e);
    }
  }

  /**
   * Creating free database along with subscription if needed
   * @param sessionMetadata
   */
  async createFreeDatabase(sessionMetadata: SessionMetadata) {
    try {
      this.logger.log('Creating free database');

      const credentials = await this.cloudUserApiService.getCapiKeys(sessionMetadata);
      const fixedSubscriptions = await this.cloudSubscriptionCapiService.getSubscriptions(
        credentials,
        CloudSubscriptionType.Fixed,
      );

      console.log('___ fixedSubscriptions', fixedSubscriptions);

      const freeSubscriptions = filter(fixedSubscriptions, { price: 0 });

      console.log('___ freeSubscriptions', freeSubscriptions)

      const freeSubscription = find(freeSubscriptions, { name: cloudConfig.freeSubscriptionName }) || freeSubscriptions[0];

      if (!freeSubscription) {
        // todo: create one
      }

      // const databases = this.getDatabase(credentials, {
      // });
      // todo: check databases
    } catch (e) {
      this.logger.error('Unable to create free database', e);
      throw wrapHttpError(e);
    }
  }
}
