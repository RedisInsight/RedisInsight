import { AppTool } from 'src/models';
import { Injectable, Logger } from '@nestjs/common';
import { DatabaseConnectionService } from 'src/modules/database/database-connection.service';
import { DatabaseOverviewProvider } from 'src/modules/database/providers/database-overview.provider';
import { DatabaseOverview } from 'src/modules/database/models/database-overview';
import { DatabaseInfoProvider } from 'src/modules/database/providers/database-info.provider';
import { RedisDatabaseInfoResponse } from 'src/modules/database/dto/redis-info.dto';
import { ClientMetadata } from 'src/common/models';

@Injectable()
export class DatabaseInfoService {
  private logger = new Logger('DatabaseInfoService');

  constructor(
    private readonly databaseConnectionService: DatabaseConnectionService,
    private readonly databaseOverviewProvider: DatabaseOverviewProvider,
    private readonly databaseInfoProvider: DatabaseInfoProvider,
  ) {}

  /**
   * Get database general info
   * @param clientMetadata
   */
  public async getInfo(clientMetadata: ClientMetadata): Promise<RedisDatabaseInfoResponse> {
    this.logger.log(`Getting database info for: ${clientMetadata.databaseId}`);

    const client = await this.databaseConnectionService.getOrCreateClient(clientMetadata);

    return this.databaseInfoProvider.getRedisGeneralInfo(client);
  }

  /**
   * Get redis database overview
   *
   * @param clientMetadata
   */
  public async getOverview(clientMetadata: ClientMetadata): Promise<DatabaseOverview> {
    this.logger.log(`Getting database overview for: ${clientMetadata.databaseId}`);

    const client = await this.databaseConnectionService.getOrCreateClient(clientMetadata);

    return this.databaseOverviewProvider.getOverview(clientMetadata.databaseId, client);
  }
}
