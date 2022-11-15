import { Injectable, Logger } from '@nestjs/common';
import { AppTool } from 'src/models';
import * as IORedis from 'ioredis';
import { generateRedisConnectionName, getRedisConnectionException } from 'src/utils';
import { DatabaseRepository } from 'src/modules/database/repositories/database.repository';
import { DatabaseAnalytics } from 'src/modules/database/database.analytics';
import { RedisService } from 'src/modules/redis/redis.service';
import { ClientMetadata } from 'src/modules/redis/models/client-metadata';
import { DatabaseService } from 'src/modules/database/database.service';
import { DatabaseInfoProvider } from 'src/modules/database/providers/database-info.provider';

@Injectable()
export class DatabaseConnectionService {
  private logger = new Logger('DatabaseConnectionService');

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly databaseInfoProvider: DatabaseInfoProvider,
    private readonly repository: DatabaseRepository,
    private readonly analytics: DatabaseAnalytics,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Connects to database and updates modules list and last connected time
   * @param databaseId
   * @param namespace
   */
  async connect(
    databaseId: string,
    namespace = AppTool.Common,
  ): Promise<void> {
    const client = await this.getOrCreateClient({
      databaseId,
      namespace,
    });

    // refresh modules list and last connected time
    // will be refreshed after user navigate to particular database from the databases list
    // Note: move to a different place in case if we need to update such info more often
    await this.repository.update(databaseId, {
      lastConnection: new Date(),
      modules: await this.databaseInfoProvider.determineDatabaseModules(client),
    });

    this.logger.log(`Succeed to connect to database ${databaseId}`);
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

    let client = (await this.redisService.getClientInstance({
      // todo: change RedisService logic to match new metadata interface
      instanceId: clientMetadata.databaseId,
      tool: clientMetadata.namespace,
      uuid: clientMetadata.uuid,
    }))?.client;

    if (client && this.redisService.isClientConnected(client)) {
      return client;
    }

    client = await this.createClient(clientMetadata);

    this.redisService.setClientInstance(
      {
        instanceId: clientMetadata.databaseId,
        tool: clientMetadata.namespace,
        uuid: clientMetadata.uuid,
      },
      client,
    );

    return client;
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
    const connectionName = generateRedisConnectionName(clientMetadata.namespace, clientMetadata.databaseId);

    try {
      return await this.redisService.connectToDatabaseInstance(
        database,
        clientMetadata.namespace,
        connectionName,
      );
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
