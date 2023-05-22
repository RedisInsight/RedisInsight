import { Injectable, Logger } from '@nestjs/common';
import * as IORedis from 'ioredis';
import { getRedisConnectionException } from 'src/utils';
import { RECOMMENDATION_NAMES } from 'src/constants';
import { DatabaseRepository } from 'src/modules/database/repositories/database.repository';
import { DatabaseAnalytics } from 'src/modules/database/database.analytics';
import { RedisService } from 'src/modules/redis/redis.service';
import { DatabaseService } from 'src/modules/database/database.service';
import { DatabaseInfoProvider } from 'src/modules/database/providers/database-info.provider';
import { DatabaseRecommendationService } from 'src/modules/database-recommendation/database-recommendation.service';
import { Database } from 'src/modules/database/models/database';
import { ConnectionType } from 'src/modules/database/entities/database.entity';
import { ClientMetadata } from 'src/common/models';
import { RedisConnectionFactory } from 'src/modules/redis/redis-connection.factory';

@Injectable()
export class DatabaseConnectionService {
  private logger = new Logger('DatabaseConnectionService');

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly databaseInfoProvider: DatabaseInfoProvider,
    private readonly repository: DatabaseRepository,
    private readonly analytics: DatabaseAnalytics,
    private readonly redisService: RedisService,
    private readonly redisConnectionFactory: RedisConnectionFactory,
    private recommendationService: DatabaseRecommendationService,
  ) {}

  /**
   * Connects to database and updates modules list and last connected time
   * @param clientMetadata
   */
  async connect(clientMetadata: ClientMetadata): Promise<void> {
    const client = await this.getOrCreateClient(clientMetadata);

    // refresh modules list and last connected time
    // mark database as not a new
    // will be refreshed after user navigate to particular database from the databases list
    // Note: move to a different place in case if we need to update such info more often
    const toUpdate: Partial<Database> = {
      new: false,
      lastConnection: new Date(),
      timeout: client.options.connectTimeout,
      modules: await this.databaseInfoProvider.determineDatabaseModules(client),
    };

    // !Temporary. Refresh cluster nodes on connection
    if (client?.isCluster) {
      const primaryNodeOptions = client.nodes('master')[0].options;

      toUpdate.host = primaryNodeOptions.host;
      toUpdate.port = primaryNodeOptions.port;

      toUpdate.nodes = client.nodes().map(({ options }) => ({
        host: options.host,
        port: options.port,
      }));
    }

    await this.repository.update(clientMetadata.databaseId, toUpdate);

    const generalInfo = await this.databaseInfoProvider.getRedisGeneralInfo(client)

    this.recommendationService.check(
      clientMetadata,
      RECOMMENDATION_NAMES.REDIS_VERSION,
      generalInfo,
    );
    this.recommendationService.check(
      clientMetadata,
      RECOMMENDATION_NAMES.LUA_SCRIPT,
      generalInfo,
    );
    this.recommendationService.check(
      clientMetadata,
      RECOMMENDATION_NAMES.BIG_AMOUNT_OF_CONNECTED_CLIENTS,
      generalInfo,
    );

    this.logger.log(`Succeed to connect to database ${clientMetadata.databaseId}`);
  }

  /**
   * Gets existing database client by client metadata or
   * fetches database and create client new client for it
   * Also saves client to the clients pool to not create the same client in the future
   * Client from the pool of clients will be automatically deleted by idle time
   * @param clientMetadata
   */
  async getOrCreateClient(clientMetadata: ClientMetadata) {
    this.logger.log('Getting database client.');

    let client = (await this.redisService.getClientInstance(clientMetadata))?.client;

    if (client && this.redisService.isClientConnected(client)) {
      return client;
    }

    client = await this.createClient(clientMetadata);

    return this.redisService.setClientInstance(clientMetadata, client)?.client;
  }

  /**
   * Simply gets database and creates a client.
   * Will always return new client. There is no check for the same client already exists
   * Could be used to create temporary client for some purposes or to "isolate" client
   * for some business logic
   * ! Will be not automatically closed by idle time
   * @param clientMetadata
   */
  async createClient(clientMetadata: ClientMetadata): Promise<IORedis.Redis | IORedis.Cluster> {
    this.logger.log('Creating database client.');
    const database = await this.databaseService.get(clientMetadata.databaseId);

    try {
      const client = await this.redisConnectionFactory.createRedisConnection(
        clientMetadata,
        database,
      );

      if (database.connectionType === ConnectionType.NOT_CONNECTED) {
        let connectionType = ConnectionType.STANDALONE;

        // cluster check
        if (client.isCluster) {
          connectionType = ConnectionType.CLUSTER;
        }

        // sentinel check
        if (client?.options?.['sentinels']?.length) {
          connectionType = ConnectionType.SENTINEL;
        }

        await this.repository.update(database.id, { connectionType });
      }

      return client;
    } catch (error) {
      this.logger.error('Failed to create database client', error);
      const exception = getRedisConnectionException(
        error,
        database,
        database.name,
      );
      this.analytics.sendConnectionFailedEvent(database, exception);
      throw exception;
    }
  }
}
