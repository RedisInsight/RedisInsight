import {
  Injectable,
} from '@nestjs/common';
import {
  DiscoverCloudDatabasesDto,
  ImportCloudDatabaseDto,
  ImportCloudDatabaseResponse,
} from 'src/modules/cloud/autodiscovery/dto';
import { CloudAutodiscoveryAuthType } from 'src/modules/cloud/autodiscovery/models';
import { SessionMetadata } from 'src/common/models';
import { CloudCapiAuthDto } from 'src/modules/cloud/common/dto';
import { wrapHttpError } from 'src/common/utils';
import { CloudAccountInfo } from 'src/modules/cloud/user/models';
import { CloudSubscription } from 'src/modules/cloud/subscription/models';
import { CloudDatabase } from 'src/modules/cloud/database/models';
import { CloudAutodiscoveryService } from 'src/modules/cloud/autodiscovery/cloud-autodiscovery.service';
import { CloudUserApiService } from 'src/modules/cloud/user/cloud-user.api.service';

@Injectable()
export class MeCloudAutodiscoveryService {
  constructor(
    private readonly cloudAutodiscoveryService: CloudAutodiscoveryService,
    private readonly cloudUserApiService: CloudUserApiService,
  ) {}

  private async getCapiCredentials(sessionMetadata: SessionMetadata): Promise<CloudCapiAuthDto> {
    return this.cloudUserApiService.getCapiKeys(sessionMetadata);
  }

  /**
   * Get cloud account short info
   * @param sessionMetadata
   */
  async getAccount(sessionMetadata: SessionMetadata): Promise<CloudAccountInfo> {
    try {
      return await this.cloudAutodiscoveryService.getAccount(
        await this.getCapiCredentials(sessionMetadata),
      );
    } catch (e) {
      // todo: error
      throw wrapHttpError(e);
    }
  }

  /**
   * Discover all subscriptions
   * @param sessionMetadata
   */
  async discoverSubscriptions(sessionMetadata: SessionMetadata): Promise<CloudSubscription[]> {
    try {
      return await this.cloudAutodiscoveryService.discoverSubscriptions(
        await this.getCapiCredentials(sessionMetadata),
        CloudAutodiscoveryAuthType.Sso,
      );
    } catch (e) {
      // todo: error
      throw wrapHttpError(e);
    }
  }

  /**
   * Get all databases from specified multiple subscriptions
   * @param sessionMetadata
   * @param dto
   */
  async discoverDatabases(
    sessionMetadata: SessionMetadata,
    dto: DiscoverCloudDatabasesDto,
  ): Promise<CloudDatabase[]> {
    try {
      return await this.cloudAutodiscoveryService.discoverDatabases(
        await this.getCapiCredentials(sessionMetadata),
        dto,
        CloudAutodiscoveryAuthType.Sso,
      );
    } catch (e) {
      // todo: error
      throw wrapHttpError(e);
    }
  }

  /**
   * Add database from cloud
   * @param sessionMetadata
   * @param addDatabasesDto
   */
  async addRedisCloudDatabases(
    sessionMetadata: SessionMetadata,
    addDatabasesDto: ImportCloudDatabaseDto[],
  ): Promise<ImportCloudDatabaseResponse[]> {
    try {
      return await this.cloudAutodiscoveryService.addRedisCloudDatabases(
        await this.getCapiCredentials(sessionMetadata),
        addDatabasesDto,
      );
    } catch (e) {
      // todo: error
      throw wrapHttpError(e);
    }
  }
}
