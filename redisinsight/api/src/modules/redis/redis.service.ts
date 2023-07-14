import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis, { Cluster } from 'ioredis';
import { isMatch, isNumber, omit } from 'lodash';
import apiConfig from 'src/utils/config';
import { ClientContext, ClientMetadata } from 'src/common/models';

const REDIS_CLIENTS_CONFIG = apiConfig.get('redis_clients');

export interface IRedisClientInstance {
  id: string,
  clientMetadata: ClientMetadata,
  client: any;
  lastTimeUsed: number;
}

@Injectable()
export class RedisService implements OnModuleDestroy {
  public clients: Map<string, IRedisClientInstance> = new Map();

  private readonly syncInterval;

  constructor() {
    setInterval(this.syncClients.bind(this), 60 * 1000); // sync clients each minute
  }

  onModuleDestroy() {
    clearInterval(this.syncInterval);
  }

  /**
   * Close connections and remove clients which were unused for some time
   * @private
   */
  private syncClients() {
    [...this.clients.keys()].forEach((id) => {
      try {
        const redisClient = this.clients.get(id);
        if (redisClient && (Date.now() - redisClient.lastTimeUsed) >= REDIS_CLIENTS_CONFIG.maxIdleThreshold) {
          redisClient.client.disconnect();
          this.clients.delete(id);
        }
      } catch (e) {
        // ignore error
      }
    });
  }

  /**
   * Get client by generated id (only one is possible)
   * Will find client by all fields from client metadata
   * @param clientMetadata
   */
  public getClientInstance(clientMetadata: ClientMetadata): IRedisClientInstance {
    const metadata = RedisService.prepareClientMetadata(clientMetadata);

    const found = this.clients.get(RedisService.generateId(metadata));

    if (found) {
      found.lastTimeUsed = Date.now();
    }

    return found;
  }

  public setClientInstance(clientMetadata: ClientMetadata, client): IRedisClientInstance {
    const metadata = RedisService.prepareClientMetadata(clientMetadata);

    const id = RedisService.generateId(metadata);
    const found = this.clients.get(id);

    const clientInstance = {
      id,
      clientMetadata: metadata,
      client,
      lastTimeUsed: Date.now(),
    };

    if (found) {
      if (this.isClientConnected(found.client)) {
        found.lastTimeUsed = Date.now();
        client.disconnect();
        return found;
      }

      found.client.disconnect();
    }

    this.clients.set(id, clientInstance);

    return clientInstance;
  }

  public removeClientInstance(clientMetadata: ClientMetadata): number {
    const metadata = RedisService.prepareClientMetadata(clientMetadata);

    const id = RedisService.generateId(metadata);
    const found = this.clients.get(id);

    if (found) {
      found.client.disconnect();
      this.clients.delete(id);
      return 1;
    }

    return 0;
  }

  public removeClientInstances(clientMetadata: Partial<ClientMetadata>): number {
    const toRemove = this.findClientInstances(clientMetadata);
    toRemove.forEach((redisClient) => {
      redisClient.client.disconnect();
      this.clients.delete(redisClient.id);
    });

    return toRemove.length;
  }

  public findClientInstances(clientMetadata: Partial<ClientMetadata>): IRedisClientInstance[] {
    const findOptions = omit(clientMetadata, 'sessionMetadata'); // omit users criteria for searching for now
    return [...this.clients.values()]
      .filter((redisClient) => isMatch(redisClient.clientMetadata, findOptions));
  }

  /**
   * Check if client is connected and ready to use
   * @param client
   */
  public isClientConnected(client: Redis | Cluster): boolean {
    try {
      return client.status === 'ready';
    } catch (e) {
      return false;
    }
  }

  /**
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

  /**
   * Generate client id string based on client metadata
   * @param cm
   */
  static generateId(cm: ClientMetadata): string {
    const empty = '(nil)';
    const separator = '_';

    const id = [
      cm.databaseId,
      cm.context,
      cm.uniqueId || empty,
      isNumber(cm.db) ? cm.db : empty,
    ].join(separator);

    // const uId = [
    //   cm.session?.userId || empty,
    //   cm.session?.sessionId || empty,
    //   cm.session?.uniqueId || empty,
    // ].join(separator);

    return [
      id,
      // uId, user ignored until will be supported everywhere across the app
    ].join(separator);
  }
}
