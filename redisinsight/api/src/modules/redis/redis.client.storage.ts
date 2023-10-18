import { isMatch, sum } from 'lodash';
import { Injectable, Logger } from '@nestjs/common';
import { RedisClient } from 'src/modules/redis/client';
import { ClientContext, ClientMetadata } from 'src/common/models';
import apiConfig from 'src/utils/config';

const REDIS_CLIENTS_CONFIG = apiConfig.get('redis_clients');

@Injectable()
export class RedisClientStorage {
  private readonly logger = new Logger('RedisClientStorage');

  private readonly clients: Map<string, RedisClient> = new Map();

  private readonly syncInterval: NodeJS.Timeout;

  constructor() {
    this.syncInterval = setInterval(this.syncClients.bind(this), REDIS_CLIENTS_CONFIG.syncInterval);
  }

  onModuleDestroy() {
    clearInterval(this.syncInterval);
  }

  /**
   * TODO: remove after investigation
   * @private
   */
  private logState() {
    const ids = [...this.clients.keys()];
    this.logger.debug(`Clients: ${ids.length}\n${ids.length > 0 ? ids.join('\n --- ') : ''}`);
  }

  /**
   * Disconnects and removes all clients with exceeded idle threshold
   * @private
   */
  private syncClients(): void {
    try {
      this.clients.forEach((client) => {
        if (client.isIdle()) {
          client.disconnect().catch((e) => this.logger.warn('Unable to disconnect client after idle', e));
          this.clients.delete(client.id);
        }
      });

      this.logState(); // todo: remove
    } catch (e) {
      // ignore errors;
    }
  }

  /**
   * Finds clients by partial clientMetadata fields and returns array of ids
   * @param clientMetadata
   * @private
   */
  private findClients(clientMetadata: Partial<ClientMetadata>): string[] {
    return [...this.clients.values()]
      .filter((redisClient) => isMatch(redisClient['clientMetadata'], clientMetadata))
      .map((client) => client.id);
  }

  /**
   * Gets client by generated id
   * Will return null if client was not found
   * @param id
   */
  public async getClient(id: string): Promise<RedisClient> {
    const client = this.clients.get(id);

    if (client) {
      client.setLastUsed();
    }

    return client;
  }

  /**
   * Will generate "id" based on client metadata and invoke getClient method
   * @param clientMetadata
   */
  public async getClientByMetadata(clientMetadata: ClientMetadata): Promise<RedisClient> {
    return this.getClient(RedisClient.generateId(RedisClientStorage.prepareClientMetadata(clientMetadata)));
  }

  /**
   * Saves client into the clients pool if there is no client with such "id"
   * When client with such "id" exists:
   * 1. If existing client has established connection - will return old client and close connection for the new one
   * 2. If existing client hasn't established connection - will replace old client with the new one
   * @param client
   */
  public async setClient(client: RedisClient): Promise<RedisClient> {
    const existingClient = this.clients.get(client.id);

    if (existingClient) {
      if (existingClient.isConnected()) {
        await client.disconnect().catch();
        return this.getClient(client.id);
      }

      await existingClient.disconnect().catch();
    }

    this.clients.set(client.id, client);

    return client;
  }

  /**
   * Disconnect client without waiting for pending commands
   * and removes it from the clients pool
   * @param id
   */
  public async removeClient(id: string): Promise<number> {
    const client = this.clients.get(id);

    if (client) {
      await client.disconnect()
        .catch((e) => this.logger.warn('Unable to disconnect client', e));

      this.clients.delete(id);

      return 1;
    }

    return 0;
  }

  /**
   * Generate id from ClientMetadata and removes client using removeClient method
   * @param clientMetadata
   */
  public async removeClientByMetadata(clientMetadata: ClientMetadata): Promise<number> {
    return this.removeClient(RedisClient.generateId(RedisClientStorage.prepareClientMetadata(clientMetadata)));
  }

  /**
   * Closes connections and removes clients by condition
   * Useful when database was removed and there is no sense wait for "idle" before remove clients
   * @param clientMetadata
   */
  public async removeClientsByMetadata(clientMetadata: Partial<ClientMetadata>): Promise<number> {
    const toRemove = this.findClients(clientMetadata);

    this.logger.debug(`Trying to remove ${toRemove.length} clients`);

    return sum(await Promise.all(toRemove.map(this.removeClient.bind(this))));
  }

  /**
   * Prepare clientMetadata to be used for generating id and other operations with clients
   * like: find, remove many, etc.
   * @param clientMetadata
   */
  static prepareClientMetadata(clientMetadata: ClientMetadata): ClientMetadata {
    return {
      ...clientMetadata,
      // Workaround: for cli connections we must ignore db index when storing/getting client
      // since inside CLI itself users are able to "select" database manually
      // uniqueness will be guaranteed by ClientMetadata.uniqueId and each opened CLI terminal
      // will have own and a single client
      db: clientMetadata.context === ClientContext.CLI ? null : clientMetadata.db,
    };
  }
}
