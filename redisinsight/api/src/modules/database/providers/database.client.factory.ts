import { Injectable, Logger } from '@nestjs/common';
import { getRedisConnectionException } from 'src/utils';
import { DatabaseRepository } from 'src/modules/database/repositories/database.repository';
import { DatabaseAnalytics } from 'src/modules/database/database.analytics';
import { DatabaseService } from 'src/modules/database/database.service';
import { ConnectionType } from 'src/modules/database/entities/database.entity';
import { ClientMetadata } from 'src/common/models';
import { RedisClient } from 'src/modules/redis/client';
import { IRedisConnectionOptions, RedisClientFactory } from 'src/modules/redis/redis.client.factory';
import { RedisClientStorage } from 'src/modules/redis/redis.client.storage';

type IsClientConnectingMap = {
  [key: string]: boolean
};

type PendingGetByClientIdMap = {
  [key: string]: { resolve: (value: RedisClient) => void, reject: (reason?: any) => void }[]
};

@Injectable()
export class DatabaseClientFactory {
  private logger = new Logger('DatabaseClientFactory');

  private isConnecting: IsClientConnectingMap = {};

  private pendingGetClient: PendingGetByClientIdMap = {};

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly repository: DatabaseRepository,
    private readonly analytics: DatabaseAnalytics,
    private readonly redisClientStorage: RedisClientStorage,
    private readonly redisClientFactory: RedisClientFactory,
  ) {}

  private async processGetClient(clientId: string, clientMetadata: ClientMetadata) {
    if (this.isConnecting[clientId]) {
      this.logger.debug('Client already connecting. Queueing get client request', { clientId });
      return;
    }
    if (!this.pendingGetClient[clientId].length) {
      return;
    }

    const { resolve, reject } = this.pendingGetClient[clientId].shift();
    this.isConnecting[clientId] = true;
    try {
      this.logger.debug('Creating new client', { clientId });
      const newClient = await this.createClient(clientMetadata);
      this.redisClientStorage.set(newClient);

      resolve(newClient);

      // resolve pending gets
      while (this.pendingGetClient[clientId]?.length) {
        const next = this.pendingGetClient[clientId].shift();
        next?.resolve(newClient);
      }
    } catch (error) {
      reject(error);

      // reject pending gets
      while (this.pendingGetClient[clientId]?.length) {
        const next = this.pendingGetClient[clientId].shift();
        next?.reject(error);
      }
    } finally {
      delete this.pendingGetClient[clientId];
      delete this.isConnecting[clientId];
    }
  }

  /**
   * Gets existing database client by client metadata or
   * fetches database and create client new client for it
   * Also saves client to the clients pool to not create the same client in the future
   * Client from the pool of clients will be automatically deleted by idle time
   * @param clientMetadata
   */
  async getOrCreateClient(clientMetadata: ClientMetadata): Promise<RedisClient> {
    this.logger.debug('Trying to get existing redis client.', clientMetadata);

    const client = await this.redisClientStorage.getByMetadata(clientMetadata);

    if (client) {
      return client;
    }

    const clientId = RedisClient.generateId(RedisClient.prepareClientMetadata(clientMetadata));

    // add promise to queue and then process queue immediately
    // in case another fetch is not already running
    return new Promise((resolve, reject) => {
      if (!this.pendingGetClient[clientId]) {
        this.pendingGetClient[clientId] = [];
      }
      this.pendingGetClient[clientId].push(({ resolve, reject }));
      this.processGetClient(clientId, clientMetadata);
    });
  }

  /**
   * Simply gets database and creates a client.
   * Will always return new client. There is no check for the same client already exists
   * Could be used to create temporary client for some purposes or to "isolate" client
   * for some business logic
   * ! Will be not automatically closed by idle time
   * @param clientMetadata
   * @param options
   */
  async createClient(clientMetadata: ClientMetadata, options?: IRedisConnectionOptions): Promise<RedisClient> {
    this.logger.debug('Creating new redis client.', clientMetadata);
    const database = await this.databaseService.get(clientMetadata.sessionMetadata, clientMetadata.databaseId);

    try {
      const client = await this.redisClientFactory.createClient(clientMetadata, database, options);

      if (database.connectionType === ConnectionType.NOT_CONNECTED) {
        await this.repository.update(
          clientMetadata.sessionMetadata,
          database.id,
          {
            connectionType: client.getConnectionType() as unknown as ConnectionType,
          },
        );
      }

      return client;
    } catch (error) {
      this.logger.error('Failed to create database client', error);
      const exception = getRedisConnectionException(
        error,
        database,
        database.name,
      );
      this.analytics.sendConnectionFailedEvent(clientMetadata.sessionMetadata, database, exception);
      throw exception;
    }
  }

  /**
   * Delete existing database client by client metadata.
   * @param clientMetadata
   */
  async deleteClient(clientMetadata: ClientMetadata): Promise<number> {
    this.logger.debug('Trying to delete existing redis client.');

    const client = await this.redisClientStorage.getByMetadata(clientMetadata);
    return this.redisClientStorage.remove(client?.id);
  }
}
