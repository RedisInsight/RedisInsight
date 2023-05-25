import { Injectable, Logger } from '@nestjs/common';
import { DatabaseConnectionService } from 'src/modules/database/database-connection.service';
import { DatabaseOverviewProvider } from 'src/modules/database/providers/database-overview.provider';
import { DatabaseOverview } from 'src/modules/database/models/database-overview';
import { DatabaseInfoProvider } from 'src/modules/database/providers/database-info.provider';
import { RedisDatabaseInfoResponse } from 'src/modules/database/dto/redis-info.dto';
import { ClientMetadata } from 'src/common/models';
import { DatabaseRecommendationService } from 'src/modules/database-recommendation/database-recommendation.service';
import { RECOMMENDATION_NAMES } from 'src/constants';
import { DatabaseService } from './database.service';

@Injectable()
export class DatabaseInfoService {
  private logger = new Logger('DatabaseInfoService');

  constructor(
    private readonly databaseConnectionService: DatabaseConnectionService,
    private readonly databaseOverviewProvider: DatabaseOverviewProvider,
    private readonly databaseInfoProvider: DatabaseInfoProvider,
    private readonly recommendationService: DatabaseRecommendationService,
    private readonly databaseService: DatabaseService,
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

    const client = await this.databaseConnectionService.getOrCreateClient({
      ...clientMetadata,
      db: undefined, // connect to default db index
    });

    return this.databaseOverviewProvider.getOverview(clientMetadata, client);
  }

  /**
   * Create connection to specified database index
   *
   * @param clientMetadata
   * @param db
   */
  public async getDatabaseIndex(clientMetadata: ClientMetadata, db: number): Promise<void> {
    this.logger.log(`Connection to database index: ${db}`);

    let client;
    const prevDb = clientMetadata.db ?? (await this.databaseService.get(clientMetadata.databaseId))?.db ?? 0;

    try {
      client = await this.databaseConnectionService.createClient({
        ...clientMetadata,
        db,
      });
      client?.disconnect?.();

      this.recommendationService.check(
        { ...clientMetadata, db },
        RECOMMENDATION_NAMES.AVOID_LOGICAL_DATABASES,
        { db, prevDb },
      );
      return undefined;
    } catch (e) {
      this.logger.error(`Unable to connect to logical database: ${db}`, e);
      client?.disconnect?.();
      throw e;
    }
  }
}
