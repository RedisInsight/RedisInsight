import Redis, { Cluster, RedisOptions } from 'ioredis';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Database } from 'src/modules/database/models/database';
import apiConfig from 'src/utils/config';
import { ConnectionOptions } from 'tls';
import { isEmpty, isNumber, set } from 'lodash';
import { cloneClassInstance, generateRedisConnectionName } from 'src/utils';
import { ConnectionType } from 'src/modules/database/entities/database.entity';
import { ClientMetadata } from 'src/common/models';
import { ClusterOptions } from 'ioredis/built/cluster/ClusterOptions';
import { SshTunnelProvider } from 'src/modules/ssh/ssh-tunnel.provider';
import { TunnelConnectionLostException } from 'src/modules/ssh/exceptions';
import ERROR_MESSAGES from 'src/constants/error-messages';

const REDIS_CLIENTS_CONFIG = apiConfig.get('redis_clients');

export interface IRedisConnectionOptions {
  useRetry?: boolean,
  connectionName?: string,
}

@Injectable()
export class RedisConnectionFactory {
  private logger = new Logger('RedisConnectionFactory');

  constructor(
    private readonly sshTunnelProvider: SshTunnelProvider,
  ) {}

  // common retry strategy
  private retryStrategy = (times: number): number => {
    if (times < REDIS_CLIENTS_CONFIG.retryTimes) {
      return Math.min(times * REDIS_CLIENTS_CONFIG.retryDelay, 2000);
    }
    return undefined;
  };

  // disable function such as retry or checkIdentity
  private dummyFn = () => undefined;

  /**
   * Normalize data to be compatible with used redis connection library
   * @param clientMetadata
   * @param database
   * @param options
   * @private
   */
  private async getRedisOptions(
    clientMetadata: ClientMetadata,
    database: Database,
    options: IRedisConnectionOptions,
  ): Promise<RedisOptions> {
    const {
      host, port, password, username, tls, db, timeout,
    } = database;
    const redisOptions: RedisOptions = {
      host,
      port,
      username,
      password,
      connectTimeout: timeout,
      db: isNumber(clientMetadata.db) ? clientMetadata.db : db,
      connectionName: options?.connectionName
        || generateRedisConnectionName(clientMetadata.context, clientMetadata.databaseId),
      showFriendlyErrorStack: true,
      maxRetriesPerRequest: REDIS_CLIENTS_CONFIG.maxRetriesPerRequest,
      retryStrategy: options?.useRetry ? this.retryStrategy : this.dummyFn,
    };

    if (tls) {
      redisOptions.tls = await this.getTLSConfig(database);
    }

    return redisOptions;
  }

  /**
   * Normalize data to be compatible with redis library cluster connection options
   * @param clientMetadata
   * @param database
   * @param options
   * @private
   */
  private async getRedisClusterOptions(
    clientMetadata: ClientMetadata,
    database: Database,
    options: IRedisConnectionOptions,
  ): Promise<ClusterOptions> {
    return {
      clusterRetryStrategy: options.useRetry ? this.retryStrategy : this.dummyFn,
      redisOptions: await this.getRedisOptions(clientMetadata, database, options),
    };
  }

  /**
   * Normalize data to be compatible with redis library sentinel connection options
   * @param clientMetadata
   * @param database
   * @param options
   * @private
   */
  private async getRedisSentinelOptions(
    clientMetadata: ClientMetadata,
    database: Database,
    options: IRedisConnectionOptions,
  ): Promise<RedisOptions> {
    const { sentinelMaster } = database;

    const baseOptions = await this.getRedisOptions(clientMetadata, database, options);
    return {
      ...baseOptions,
      host: undefined,
      port: undefined,
      sentinels: database.nodes?.length ? database.nodes : [{ host: database.host, port: database.port }],
      name: sentinelMaster?.name,
      sentinelUsername: database.username,
      sentinelPassword: database.password,
      username: sentinelMaster?.username,
      password: sentinelMaster?.password,
      sentinelTLS: baseOptions.tls,
      enableTLSForSentinelMode: !!baseOptions.tls, // previously was always `true` for tls connections
      sentinelRetryStrategy: options?.useRetry ? this.retryStrategy : this.dummyFn,
    };
  }

  /**
   * Normalize tls settings to be compatible with user redis connection library
   * @param database
   * @private
   */
  private async getTLSConfig(database: Database): Promise<ConnectionOptions> {
    let config: ConnectionOptions;
    config = {
      rejectUnauthorized: database.verifyServerCert,
      checkServerIdentity: this.dummyFn,
      servername: database.tlsServername || undefined,
    };
    if (database.caCert) {
      config = {
        ...config,
        ca: [database.caCert.certificate],
      };
    }
    if (database.clientCert) {
      config = {
        ...config,
        cert: database.clientCert.certificate,
        key: database.clientCert.key,
      };
    }

    return config;
  }

  /**
   * Try to create standalone redis connection
   * @param clientMetadata
   * @param database
   * @param options
   */
  public async createStandaloneConnection(
    clientMetadata: ClientMetadata,
    database: Database,
    options: IRedisConnectionOptions,
  ): Promise<Redis> {
    let tnl;
    let connection: Redis;

    try {
      const config = await this.getRedisOptions(clientMetadata, database, options);
      // cover cases when we are connecting to sentinel using standalone client to discover master groups
      const dbIndex = config.db > 0 && !database.sentinelMaster ? config.db : 0;

      if (database.ssh) {
        tnl = await this.sshTunnelProvider.createTunnel(database);
      }

      return await new Promise((resolve, reject) => {
        try {
          let lastError: Error;

          if (tnl) {
            tnl.on('error', (error) => {
              reject(error);
            });

            tnl.on('close', () => {
              reject(new TunnelConnectionLostException());
            });

            config.host = tnl.serverAddress.host;
            config.port = tnl.serverAddress.port;
          }

          connection = new Redis({
            ...config,
            db: 0,
          });
          connection.on('error', (e): void => {
            this.logger.error('Failed connection to the redis database.', e);
            lastError = e;
          });
          connection.on('end', (): void => {
            this.logger.error(ERROR_MESSAGES.UNABLE_TO_ESTABLISH_CONNECTION, lastError);
            reject(lastError || new InternalServerErrorException(ERROR_MESSAGES.SERVER_CLOSED_CONNECTION));
          });
          connection.on('ready', (): void => {
            lastError = null;
            this.logger.log('Successfully connected to the redis database');

            // manual switch to particular logical db
            // since ioredis doesn't handle "select" command error during connection
            if (dbIndex > 0) {
              connection.select(dbIndex)
                .then(() => {
                  set(connection, ['options', 'db'], dbIndex);
                  resolve(connection);
                })
                .catch(reject);
            } else {
              resolve(connection);
            }
          });
          connection.on('reconnecting', (): void => {
            lastError = null;
            this.logger.log(ERROR_MESSAGES.RECONNECTING_TO_DATABASE);
          });
        } catch (e) {
          reject(e);
        }
      }) as Redis;
    } catch (e) {
      connection?.disconnect?.();
      tnl?.close?.();
      throw e;
    }
  }

  /**
   * Try to create redis cluster connection
   * @param clientMetadata
   * @param database
   * @param options
   */
  public async createClusterConnection(
    clientMetadata: ClientMetadata,
    database: Database,
    options: IRedisConnectionOptions,
  ): Promise<Cluster> {
    let connection: Cluster;

    try {
      const config = await this.getRedisClusterOptions(clientMetadata, database, options);

      if (database.ssh) {
        throw new Error('SSH is unsupported for cluster databases.');
      }

      return await (new Promise((resolve, reject) => {
        try {
          let lastError: Error;

          connection = new Cluster([{
            host: database.host,
            port: database.port,
          }].concat(database.nodes), {
            ...config,
            redisOptions: {
              ...config.redisOptions,
              db: 0,
            },
          });
          connection.on('error', (e): void => {
            this.logger.error('Failed connection to the redis oss cluster', e);
            lastError = !isEmpty(e.lastNodeError) ? e.lastNodeError : e;
          });
          connection.on('end', (): void => {
            this.logger.error(ERROR_MESSAGES.UNABLE_TO_ESTABLISH_CONNECTION, lastError);
            reject(lastError || new InternalServerErrorException(ERROR_MESSAGES.SERVER_CLOSED_CONNECTION));
          });
          connection.on('ready', (): void => {
            lastError = null;
            this.logger.log('Successfully connected to the redis oss cluster.');

            // manual switch to particular logical db
            // since ioredis doesn't handle "select" command error during connection
            if (config.redisOptions.db > 0) {
              connection.select(config.redisOptions.db)
                .then(() => {
                  set(connection, ['options', 'db'], config.redisOptions.db);
                  resolve(connection);
                })
                .catch(reject);
            } else {
              resolve(connection);
            }
          });
          connection.on('reconnecting', (): void => {
            lastError = null;
            this.logger.log(ERROR_MESSAGES.RECONNECTING_TO_DATABASE);
          });
        } catch (e) {
          reject(e);
        }
      }));
    } catch (e) {
      connection?.disconnect?.();
      throw e;
    }
  }

  /**
   * Try to create redis sentinel connection
   * @param clientMetadata
   * @param database
   * @param options
   */
  public async createSentinelConnection(
    clientMetadata: ClientMetadata,
    database: Database,
    options: IRedisConnectionOptions,
  ): Promise<Redis> {
    let connection: Redis;

    try {
      const config = await this.getRedisSentinelOptions(clientMetadata, database, options);

      return await (new Promise((resolve, reject) => {
        try {
          let lastError: Error;

          connection = new Redis({
            ...config,
            db: 0,
          });
          connection.on('error', (e): void => {
            this.logger.error('Failed connection to the redis oss sentinel', e);
            lastError = e;
          });
          connection.on('end', (): void => {
            this.logger.error(ERROR_MESSAGES.UNABLE_TO_ESTABLISH_CONNECTION, lastError);
            reject(lastError || new InternalServerErrorException(ERROR_MESSAGES.SERVER_CLOSED_CONNECTION));
          });
          connection.on('ready', (): void => {
            lastError = null;
            this.logger.log('Successfully connected to the redis oss sentinel.');

            // manual switch to particular logical db
            // since ioredis doesn't handle "select" command error during connection
            if (config.db > 0) {
              connection.select(config.db)
                .then(() => {
                  set(connection, ['options', 'db'], config.db);
                  resolve(connection);
                })
                .catch(reject);
            } else {
              resolve(connection);
            }
          });
          connection.on('reconnecting', (): void => {
            lastError = null;
            this.logger.log(ERROR_MESSAGES.RECONNECTING_TO_DATABASE);
          });
        } catch (e) {
          reject(e);
        }
      }));
    } catch (e) {
      connection?.disconnect?.();
      throw e;
    }
  }

  /**
   * Based on data fields (except connectionType) will try to cte connection of proper type
   * @param clientMetadata
   * @param database
   * @param connectionName
   */
  public async createClientAutomatically(
    clientMetadata: ClientMetadata,
    database: Database,
    connectionName?,
  ) {
    // try sentinel connection
    if (database?.sentinelMaster) {
      try {
        return await this.createSentinelConnection(clientMetadata, database, {
          useRetry: true,
          connectionName,
        });
      } catch (e) {
        // ignore error
      }
    }

    // try cluster connection
    try {
      return await this.createClusterConnection(clientMetadata, database, {
        useRetry: true,
        connectionName,
      });
    } catch (e) {
      // ignore error
    }

    // Standalone in any other case
    return this.createStandaloneConnection(clientMetadata, database, {
      useRetry: true,
      connectionName,
    });
  }

  /**
   * Create connection based on connectionType or try to determine connectionType automatically
   * @param clientMetadata
   * @param databaseDto
   * @param connectionName
   */
  public async createRedisConnection(
    clientMetadata: ClientMetadata,
    databaseDto: Database,
    connectionName?,
  ): Promise<Redis | Cluster> {
    const database = cloneClassInstance(databaseDto);
    Object.keys(database).forEach((key: string) => {
      if (database[key] === null) {
        delete database[key];
      }
    });

    let client;

    switch (database?.connectionType) {
      case ConnectionType.STANDALONE:
        client = await this.createStandaloneConnection(clientMetadata, database, {
          useRetry: true,
          connectionName,
        });
        break;
      case ConnectionType.CLUSTER:
        client = await this.createClusterConnection(clientMetadata, database, {
          useRetry: true,
          connectionName,
        });
        break;
      case ConnectionType.SENTINEL:
        client = await this.createSentinelConnection(clientMetadata, database, {
          useRetry: true,
          connectionName,
        });
        break;
      default:
        // AUTO
        client = await this.createClientAutomatically(clientMetadata, database, connectionName);
    }

    return client;
  }
}
