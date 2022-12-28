import { Injectable } from '@nestjs/common';
import Redis, { Cluster } from 'ioredis';
import {
  isMatch, omit, isNumber, pick,
} from 'lodash';
import apiConfig from 'src/utils/config';
import { ClientMetadata } from 'src/common/models';

const REDIS_CLIENTS_CONFIG = apiConfig.get('redis_clients');

export interface IRedisClientInstance {
  id: string,
  clientMetadata: ClientMetadata,
  client: any;
  lastTimeUsed: number;
}

@Injectable()
export class RedisService {
  public clients: Map<string, IRedisClientInstance> = new Map();

  constructor() {
    setInterval(this.syncClients.bind(this), 60 * 1000); // sync clients each minute
  }

  /**
   * Close connections and remove clients which were unused for some time
   * @private
   */
  private syncClients() {
    [...this.clients.keys()].forEach((id) => {
      const redisClient = this.clients.get(id);
      if (redisClient && (Date.now() - redisClient.lastTimeUsed) >= REDIS_CLIENTS_CONFIG.maxIdleThreshold) {
        redisClient.client.disconnect();
        this.clients.delete(id);
      }
    });
  }

  /**
   * Get client by generated id (only one is possible)
   * Will find client by all fields from client metadata
   * @param clientMetadata
   */
  public getClientInstance(clientMetadata: ClientMetadata): IRedisClientInstance {
    const found = this.clients.get(RedisService.generateId(clientMetadata));

    if (found) {
      found.lastTimeUsed = Date.now();
    }

    console.log('___ getting client instance: ID', RedisService.generateId(clientMetadata))
    console.log('___ getting client instance: all clients', [...this.clients.values()].map((v) => pick(v, 'id')))

    // this.syncClients();
    return found;
  }

  public setClientInstance(clientMetadata: ClientMetadata, client): 0 | 1 {
    const id = RedisService.generateId(clientMetadata);
    const found = this.clients.get(id);

    const clientInstance = {
      id,
      clientMetadata,
      client,
      lastTimeUsed: Date.now(),
    };

    if (found) {
      found.client.disconnect();
      this.clients.delete(id);
      this.clients.set(id, clientInstance);
      return 0; // todo: investigate why we need to distinguish between 1 | 0
    }

    this.clients.set(id, clientInstance);

    console.log('___ set client instance: ID', RedisService.generateId(clientMetadata))
    console.log('___ set client instance: all clients', [...this.clients.values()].map((v) => pick(v, 'id')))

    return 1;
  }

  public removeClientInstance(clientMetadata: ClientMetadata): number {
    const id = RedisService.generateId(clientMetadata);
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
    const findOptions = omit(clientMetadata, 'session'); // omit users criteria for searching for now
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
