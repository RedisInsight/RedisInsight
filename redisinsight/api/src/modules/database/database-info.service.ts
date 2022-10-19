import { AppTool } from 'src/models';
import { RedisDatabaseInfoResponse } from 'src/modules/instances/dto/redis-info.dto';
import { Injectable, Logger } from '@nestjs/common';
import { DatabaseConnectionService } from 'src/modules/database/database-connection.service';
import { ConfigurationBusinessService } from 'src/modules/shared/services/configuration-business/configuration-business.service';
import { DatabaseOverviewProvider } from 'src/modules/database/providers/database-overview.provider';
import { DatabaseOverview } from 'src/modules/database/models/database-overview';

@Injectable()
export class DatabaseInfoService {
  private logger = new Logger('DatabaseInfoService');

  constructor(
    private readonly databaseConnectionService: DatabaseConnectionService,
    private readonly redisConfBusinessService: ConfigurationBusinessService,
    private readonly databaseOverviewProvider: DatabaseOverviewProvider,
  ) {}

  /**
   * Get database general info
   * @param databaseId
   * @param namespace
   */
  public async getInfo(
    databaseId: string,
    namespace = AppTool.Common,
  ): Promise<RedisDatabaseInfoResponse> {
    this.logger.log(`Getting database info for: ${databaseId}`);

    const client = await this.databaseConnectionService.getOrCreateClient({
      databaseId,
      namespace,
    });

    return this.redisConfBusinessService.getRedisGeneralInfo(client);
  }

  /**
   * Get redis database overview
   *
   * @param databaseId
   */
  public async getOverview(databaseId: string): Promise<DatabaseOverview> {
    this.logger.log(`Getting database overview for: ${databaseId}`);

    const client = await this.databaseConnectionService.getOrCreateClient({
      databaseId,
      namespace: AppTool.Common,
    });

    return this.databaseOverviewProvider.getOverview(databaseId, client);
  }
}
