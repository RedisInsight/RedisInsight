import { Injectable, Logger } from '@nestjs/common';
import { ConnectionOptions, SecureContextOptions } from 'tls';
import * as Redis from 'ioredis';
import IORedis, { RedisOptions } from 'ioredis';
import {
  find, findIndex, isEmpty, isNil, omitBy, remove,
} from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { AppTool } from 'src/models';
import apiConfig from 'src/utils/config';
import { CONNECTION_NAME_GLOBAL_PREFIX } from 'src/constants';
import {
  ConnectionOptionsDto,
  DatabaseInstanceResponse,
  TlsDto,
} from 'src/modules/instances/dto/database-instance.dto';
import { IRedisClusterNodeAddress } from 'src/models/redis-cluster';
import { ConnectionType } from 'src/modules/core/models/database-instance.entity';
import { CaCertBusinessService } from '../certificates/ca-cert-business/ca-cert-business.service';
import { ClientCertBusinessService } from '../certificates/client-cert-business/client-cert-business.service';

const REDIS_CLIENTS_CONFIG = apiConfig.get('redis_clients');

export interface ISetClientInstanceOptions {
  instanceId: string;
  tool: AppTool;
  uuid: string;
}

export interface IRedisClientInstance {
  instanceId: string;
  tool: AppTool;
  client: any;
  uuid: string;
  lastTimeUsed: number;
  clientAddress?: string;
}

export interface IFindRedisClientInstanceByOptions {
  instanceId: string;
  tool?: AppTool;
  uuid?: string;
}

@Injectable()
export class RedisService {
  private logger = new Logger('RedisService');

  private lastClientsSync: number;

  public clients: IRedisClientInstance[] = [];

  constructor(
    private caCertBusinessService: CaCertBusinessService,
    private clientCertBusinessService: ClientCertBusinessService,
  ) {
    this.lastClientsSync = Date.now();
  }

  public async createStandaloneClient(
    options: ConnectionOptionsDto,
    appTool: AppTool,
    useRetry: boolean,
    connectionName: string = CONNECTION_NAME_GLOBAL_PREFIX,
  ): Promise<IORedis.Redis> {
    const config = await this.getRedisConnectionConfig(options);

    return new Promise((resolve, reject) => {
      try {
        const client = new Redis({
          ...config,
          showFriendlyErrorStack: true,
          maxRetriesPerRequest: REDIS_CLIENTS_CONFIG.maxRetriesPerRequest,
          connectionName,
          retryStrategy: useRetry ? this.retryStrategy : () => undefined,
        });
        client.on('error', (e): void => {
          this.logger.error('Failed connection to the redis database.', e);
          reject(e);
        });
        client.on('ready', (): void => {
          this.logger.log('Successfully connected to the redis database');
          resolve(client);
        });
        client.on('reconnecting', (): void => {
          this.logger.log('Reconnecting to the redis database');
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  public async createClusterClient(
    options: ConnectionOptionsDto,
    nodes: IRedisClusterNodeAddress[],
    useRetry: boolean = false,
    connectionName: string = CONNECTION_NAME_GLOBAL_PREFIX,
  ): Promise<IORedis.Cluster> {
    const config = await this.getRedisConnectionConfig(options);
    return new Promise((resolve, reject) => {
      try {
        const cluster = new Redis.Cluster(nodes, {
          clusterRetryStrategy: useRetry ? this.retryStrategy : () => undefined,
          redisOptions: {
            ...config,
            showFriendlyErrorStack: true,
            maxRetriesPerRequest: REDIS_CLIENTS_CONFIG.maxRetriesPerRequest,
            connectionName,
            retryStrategy: useRetry ? this.retryStrategy : () => undefined,
          },
        });
        cluster.on('error', (e): void => {
          this.logger.error('Failed connection to the redis oss cluster', e);
          reject(!isEmpty(e.lastNodeError) ? e.lastNodeError : e);
        });
        cluster.on('ready', (): void => {
          this.logger.log('Successfully connected to the redis oss cluster.');
          resolve(cluster);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  public async createSentinelClient(
    options: ConnectionOptionsDto,
    sentinels: Array<{ host: string; port: number }>,
    appTool: AppTool,
    useRetry: boolean = false,
    connectionName: string = CONNECTION_NAME_GLOBAL_PREFIX,
  ): Promise<IORedis.Redis> {
    const {
      username, password, sentinelMaster, tls, db,
    } = options;
    const config: RedisOptions = {
      sentinels,
      name: sentinelMaster.name,
      sentinelUsername: username,
      sentinelPassword: password,
      db,
      username: sentinelMaster?.username,
      password: sentinelMaster?.password,
    };

    if (tls) {
      const tlsConfig = await this.getTLSConfig(tls);
      config.tls = tlsConfig;
      config.sentinelTLS = tlsConfig;
      config.enableTLSForSentinelMode = true;
    }
    return new Promise((resolve, reject) => {
      try {
        const client = new Redis({
          ...config,
          showFriendlyErrorStack: true,
          maxRetriesPerRequest: REDIS_CLIENTS_CONFIG.maxRetriesPerRequest,
          connectionName,
          retryStrategy: useRetry ? this.retryStrategy : () => undefined,
          sentinelRetryStrategy: useRetry
            ? this.retryStrategy
            : () => undefined,
        });
        client.on('error', (e): void => {
          this.logger.error('Failed connection to the redis oss sentinel', e);
          reject(e);
        });
        client.on('ready', (): void => {
          this.logger.log('Successfully connected to the redis oss sentinel.');
          resolve(client);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  public async connectToDatabaseInstance(
    databaseDto: DatabaseInstanceResponse,
    tool = AppTool.Common,
    connectionName?,
  ): Promise<IORedis.Redis | IORedis.Cluster> {
    const database = databaseDto;
    Object.keys(database).forEach((key: string) => {
      if (database[key] === null) {
        delete database[key];
      }
    });
    let client;
    const { endpoints, connectionType, ...options } = database;
    switch (connectionType) {
      case ConnectionType.STANDALONE:
        client = await this.createStandaloneClient(database, tool, true, connectionName);
        break;
      case ConnectionType.CLUSTER:
        client = await this.createClusterClient(options, endpoints, true, connectionName);
        break;
      case ConnectionType.SENTINEL:
        client = await this.createSentinelClient(options, endpoints, tool, true, connectionName);
        break;
      default:
        client = await this.createStandaloneClient(database, tool, true, connectionName);
    }

    return client;
  }

  public isClientConnected(client: IORedis.Redis | IORedis.Cluster): boolean {
    try {
      return client.status === 'ready';
    } catch (e) {
      return false;
    }
  }

  public getClientInstance(
    options: IFindRedisClientInstanceByOptions,
  ): IRedisClientInstance {
    const found = this.findClientInstance(options.instanceId, options.tool, options.uuid);
    if (found) {
      found.lastTimeUsed = Date.now();
    }
    this.syncClients();
    return found;
  }

  public removeClientInstance(
    options: IFindRedisClientInstanceByOptions,
  ): number {
    const removed: IRedisClientInstance[] = remove<IRedisClientInstance>(
      this.clients,
      options,
    );
    removed.forEach((clientInstance) => {
      clientInstance.client.disconnect();
    });
    return removed.length;
  }

  public async setClientInstance(options: ISetClientInstanceOptions, client): Promise<0 | 1> {
    const found = this.findClientInstance(options.instanceId, options.tool, options.uuid);
    if (found) {
      const index = findIndex(this.clients, { uuid: found.uuid });
      this.clients[index].client.disconnect();
      this.clients[index] = {
        ...this.clients[index],
        lastTimeUsed: Date.now(),
        client,
      };
      return 0;
    }
    const clientInstance: IRedisClientInstance = {
      ...options,
      uuid: options.uuid || uuidv4(),
      clientAddress: await RedisService.getClientAddress(client),
      lastTimeUsed: Date.now(),
      client,
    };
    this.clients.push(clientInstance);
    return 1;
  }

  private syncClients() {
    const currentTime = Date.now();
    const syncDif = currentTime - this.lastClientsSync;
    if (syncDif >= REDIS_CLIENTS_CONFIG.idleSyncInterval) {
      this.lastClientsSync = currentTime;
      this.clients = this.clients.filter((item) => {
        const idle = Date.now() - item.lastTimeUsed;
        if (idle >= REDIS_CLIENTS_CONFIG.maxIdleThreshold) {
          item.client.disconnect();
          return false;
        }
        return true;
      });
    }
  }

  private async getRedisConnectionConfig(
    options: ConnectionOptionsDto,
  ): Promise<IORedis.RedisOptions> {
    const {
      host, port, password, username, tls, db,
    } = options;
    const config: IORedis.RedisOptions = {
      host, port, username, password, db,
    };
    if (tls) {
      config.tls = await this.getTLSConfig(tls);
    }
    return config;
  }

  private async getTLSConfig(tls: TlsDto): Promise<ConnectionOptions> {
    let config: ConnectionOptions;
    config = {
      rejectUnauthorized: tls.verifyServerCert,
      checkServerIdentity: () => undefined,
    };
    if (tls.caCertId || tls.newCaCert) {
      const caCertConfig = await this.getCaCertConfig(tls);
      config = {
        ...config,
        ...caCertConfig,
      };
    }
    if (tls.clientCertPairId || tls.newClientCertPair) {
      const clientCertConfig = await this.getClientCertConfig(tls);
      config = {
        ...config,
        ...clientCertConfig,
      };
    }
    return config;
  }

  private async getCaCertConfig(tlsDto: TlsDto): Promise<SecureContextOptions> {
    if (tlsDto.caCertId) {
      const caCertificateEntity = await this.caCertBusinessService.getOneById(tlsDto.caCertId);
      return {
        ca: [caCertificateEntity.certificate],
      };
    }
    if (tlsDto.newCaCert) {
      return {
        ca: [tlsDto.newCaCert.cert],
      };
    }
    return null;
  }

  private async getClientCertConfig(
    tlsDto: TlsDto,
  ): Promise<SecureContextOptions> {
    if (tlsDto.clientCertPairId) {
      const clientCertificateEntity = await this.clientCertBusinessService.getOneById(
        tlsDto.clientCertPairId,
      );

      return {
        cert: clientCertificateEntity.certificate,
        key: clientCertificateEntity.key,
      };
    }
    if (tlsDto.newClientCertPair) {
      return {
        key: tlsDto.newClientCertPair.key,
        cert: tlsDto.newClientCertPair.cert,
      };
    }
    return null;
  }

  private retryStrategy(times: number): number {
    if (times < REDIS_CLIENTS_CONFIG.retryTimes) {
      return Math.min(times * REDIS_CLIENTS_CONFIG.retryDelay, 2000);
    }
    return undefined;
  }

  private findClientInstance(
    instanceId: string,
    tool: AppTool = AppTool.Common,
    uuid: string = undefined,
  ): IRedisClientInstance {
    const options = omitBy({ instanceId, uuid, tool }, isNil);
    return find<IRedisClientInstance>(this.clients, options);
  }

  public findClientInstanceByAddress(
    clientAddress: string,
  ): IRedisClientInstance {
    return find<IRedisClientInstance>(this.clients, { clientAddress });
  }

  static async getClientAddress(redis: IORedis.Redis | IORedis.Cluster): Promise<string> {
    try {
      return (await redis.client('info')).split(' ')[1].split('=')[1];
    } catch (error) {
      return undefined;
    }
  }
}
