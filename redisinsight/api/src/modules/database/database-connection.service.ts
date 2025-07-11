import { Injectable, Logger } from '@nestjs/common';
import { RECOMMENDATION_NAMES } from 'src/constants';
import { DatabaseRepository } from 'src/modules/database/repositories/database.repository';
import { DatabaseAnalytics } from 'src/modules/database/database.analytics';
import { DatabaseInfoProvider } from 'src/modules/database/providers/database-info.provider';
import { DatabaseRecommendationService } from 'src/modules/database-recommendation/database-recommendation.service';
import { Database } from 'src/modules/database/models/database';
import { ClientMetadata } from 'src/common/models';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import { RedisClient, RedisClientConnectionType } from 'src/modules/redis/client';
import { FeatureService } from 'src/modules/feature/feature.service';
import { KnownFeatures } from 'src/modules/feature/constants';
import { MicrosoftAuthService } from 'src/modules/auth/microsoft-auth/microsoft-azure-auth.service';

@Injectable()
export class DatabaseConnectionService {
  private logger = new Logger('DatabaseConnectionService');

  constructor(
    private readonly databaseClientFactory: DatabaseClientFactory,
    private readonly databaseInfoProvider: DatabaseInfoProvider,
    private readonly repository: DatabaseRepository,
    private readonly analytics: DatabaseAnalytics,
    private readonly featureService: FeatureService,
    private readonly recommendationService: DatabaseRecommendationService,
    private readonly microsoftAuthService: MicrosoftAuthService,
  ) {}

  /**
   * Connects to database and updates modules list and last connected time
   * @param clientMetadata
   */
  async connect(clientMetadata: ClientMetadata): Promise<void> {
    const client = await this.databaseClientFactory.getOrCreateClient(clientMetadata);
    // refresh modules list and last connected time
    // mark database as not a new
    // will be refreshed after user navigate to particular database from the databases list
    // Note: move to a different place in case if we need to update such info more often
    const toUpdate: Partial<Database> = {
      new: false,
      lastConnection: new Date(),
      modules: await this.databaseInfoProvider.determineDatabaseModules(client),
      version: await this.databaseInfoProvider.determineDatabaseServer(client),
    };

    const connectionType = client?.getConnectionType();
    // Update cluster nodes db record
    if (connectionType === RedisClientConnectionType.CLUSTER) {
      toUpdate.nodes = (await client.nodes()).map(({ options }) => ({
        host: options.host,
        port: options.port,
      }));
    }

    await this.repository.update(clientMetadata.sessionMetadata, clientMetadata.databaseId, toUpdate);

    // Get the database to check if it's an Azure database
    const database = await this.repository.get(clientMetadata.sessionMetadata, clientMetadata.databaseId);

    // TODO: Update once the flow has been fixed on MS's side to filter the old Redis Caches and check for AMRs
    const isAzureDatabase = database?.provider === 'AZURE' ||
                            (database?.cloudDetails && database?.cloudDetails.hasOwnProperty('provider') &&
                            database?.cloudDetails['provider'] === 'AZURE');


    // Only associate Microsoft auth account with Azure databases
    if (isAzureDatabase) {
      await this.microsoftAuthService.associateAccountWithDatabase(clientMetadata.databaseId);
    }
    const generalInfo = await this.databaseInfoProvider.getRedisGeneralInfo(client);

    this.recommendationService.checkMulti(
      clientMetadata,
      [
        RECOMMENDATION_NAMES.REDIS_VERSION,
        RECOMMENDATION_NAMES.LUA_SCRIPT,
        RECOMMENDATION_NAMES.BIG_AMOUNT_OF_CONNECTED_CLIENTS,
      ],
      generalInfo,
    );

    const rdiFeature = await this.featureService.getByName(clientMetadata.sessionMetadata, KnownFeatures.Rdi);

    if (rdiFeature?.flag) {
      const database = await this.repository.get(clientMetadata.sessionMetadata, clientMetadata.databaseId);
      this.recommendationService.check(
        clientMetadata,
        RECOMMENDATION_NAMES.TRY_RDI,
        { connectionType, provider: database.provider },
      );
    }

    this.collectClientInfo(clientMetadata, client, generalInfo?.version);

    this.logger.debug(`Succeed to connect to database ${clientMetadata.databaseId}`, clientMetadata);
  }

  private async collectClientInfo(clientMetadata: ClientMetadata, client: RedisClient, version?: string) {
    try {
      const intVersion = parseInt(version, 10) || 0;
      const clients = await this.databaseInfoProvider.getClientListInfo(client) || [];

      this.analytics.sendDatabaseConnectedClientListEvent(
        clientMetadata.sessionMetadata,
        clientMetadata.databaseId,
        {
          clients: clients.map((c) => ({
            version: version || 'n/a',
            resp: intVersion < 7 ? undefined : c?.['resp'] || 'n/a',
            libName: intVersion < 7 ? undefined : c?.['lib-name'] || 'n/a',
            libVer: intVersion < 7 ? undefined : c?.['lib-ver'] || 'n/a',
          })),
        },
      );
    } catch (error) {
      // ignore errors
    }
  }
}
