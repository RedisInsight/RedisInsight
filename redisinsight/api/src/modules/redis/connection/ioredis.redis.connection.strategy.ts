import { RedisConnectionStrategy } from 'src/modules/redis/connection/redis.connection.strategy';
import serverConfig from 'src/utils/config';
import { InternalServerErrorException } from '@nestjs/common';
import { ClientMetadata, Endpoint } from 'src/common/models';
import { Database } from 'src/modules/database/models/database';
import Redis, { Cluster, RedisOptions } from 'ioredis';
import { isEmpty, isNumber } from 'lodash';
import { IRedisConnectionOptions } from 'src/modules/redis/redis.client.factory';
import { ClusterOptions } from 'ioredis/built/cluster/ClusterOptions';
import { ConnectionOptions } from 'tls';
import { TunnelConnectionLostException } from 'src/modules/ssh/exceptions';
import ERROR_MESSAGES from 'src/constants/error-messages';
import {
  RedisClient,
  StandaloneIoredisClient,
  SentinelIoredisClient,
  ClusterIoredisClient,
} from 'src/modules/redis/client';
import { parseClusterNodesResponse } from '../../../../test/helpers/utils';

const REDIS_CLIENTS_CONFIG = serverConfig.get('redis_clients');

export class IoredisRedisConnectionStrategy extends RedisConnectionStrategy {
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
        || RedisConnectionStrategy.generateRedisConnectionName(clientMetadata),
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
      sentinels: [{ host: database.host, port: database.port, ...(database.nodes || []) }],
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
   * @inheritDoc
   */
  public async createStandaloneClient(
    clientMetadata: ClientMetadata,
    database: Database,
    options: IRedisConnectionOptions,
  ): Promise<RedisClient> {
    this.logger.debug('Creating ioredis standalone client');

    let tnl;

    try {
      const config = await this.getRedisOptions(clientMetadata, database, options);

      if (database.ssh) {
        tnl = await this.sshTunnelProvider.createTunnelNew(database, database.sshOptions);
      }

      return await new Promise((resolve, reject) => {
        try {
          if (tnl) {
            // tnl.on('error', (error) => {
            //   reject(error);
            // });
            //
            // tnl.on('close', () => {
            //   reject(new TunnelConnectionLostException());
            // });

            config.host = tnl[0].address().host;
            config.port = tnl[0].address().port;
          }

          const connection = new Redis({
            ...config,
            // cover cases when we are connecting to sentinel as to standalone to discover master groups
            db: config.db > 0 && !database.sentinelMaster ? config.db : 0,
          });
          connection.on('error', (e): void => {
            this.logger.error('Failed connection to the redis database.', e);
            reject(e);
          });
          connection.on('end', (): void => {
            this.logger.error(ERROR_MESSAGES.SERVER_CLOSED_CONNECTION);
            reject(new InternalServerErrorException(ERROR_MESSAGES.SERVER_CLOSED_CONNECTION));
          });
          connection.on('ready', (): void => {
            this.logger.log('Successfully connected to the redis database');
            resolve(new StandaloneIoredisClient(
              clientMetadata,
              connection,
              {
                host: database.host,
                port: database.port,
              },
            ));
          });
          connection.on('reconnecting', (): void => {
            this.logger.log('Reconnecting to the redis database');
          });
        } catch (e) {
          reject(e);
        }
      });
    } catch (e) {
      // tnl?.close?.();
      throw e;
    }
  }

  /**
   * @inheritDoc
   */
  public async createClusterClient(
    clientMetadata: ClientMetadata,
    database: Database,
    options: IRedisConnectionOptions,
  ): Promise<RedisClient> {
    const config = await this.getRedisClusterOptions(clientMetadata, database, options);
    let rootNodes = [{
      host: database.host,
      port: database.port,
    }];

    console.log('___ Creating standalone client...')
    const standaloneClient = await this.createStandaloneClient(clientMetadata, database, options);

    console.log('___ Fetching cluster nodes...')

    const nodes = parseClusterNodesResponse(
      await standaloneClient.sendCommand(['cluster', 'nodes'], { replyEncoding: 'utf8' }) as string,
    ) as Endpoint[];

    await standaloneClient.disconnect();

    console.log('___ nodes', nodes);

    rootNodes = nodes.map((node) => ({ host: node.host, port: node.port }));

    let tnls = []
    if (database.ssh) {
      let natMap = {};

      tnls = await Promise.all(nodes.map((node) => this.sshTunnelProvider.createTunnelNew(node, database.sshOptions)));

      tnls.forEach(([server], i) => {
        natMap[`${nodes[i].host}:${nodes[i].port}`] = {
          host: server.address().address,
          port: server.address().port,
        }
      })


      console.log('____ natMap', natMap)
      rootNodes = tnls.map(([server]) => ({ host: server.address().address, port: server.address().port }));
      config.natMap = natMap;
    }

    console.log('___ config', require('util').inspect(config, { depth: null }));
    console.log('___ rootNodes', require('util').inspect(rootNodes, { depth: null }));
    // throw new Error('SSH is not supported for cluster databases.');

    return new Promise((resolve, reject) => {
      try {
        const cluster = new Cluster(rootNodes.concat(database.nodes), {
          ...config,
        });
        cluster.on('error', (e): void => {
          this.logger.error('Failed connection to the redis oss cluster', e);
          reject(!isEmpty(e.lastNodeError) ? e.lastNodeError : e);
        });
        cluster.on('end', (): void => {
          this.logger.error(ERROR_MESSAGES.SERVER_CLOSED_CONNECTION);
          reject(new InternalServerErrorException(ERROR_MESSAGES.SERVER_CLOSED_CONNECTION));
        });
        cluster.on('ready', (): void => {
          this.logger.log('Successfully connected to the redis oss cluster.');
          resolve(new ClusterIoredisClient(
            clientMetadata,
            cluster,
            {
              host: database.host,
              port: database.port,
            },
          ));
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * @inheritDoc
   */
  public async createSentinelClient(
    clientMetadata: ClientMetadata,
    database: Database,
    options: IRedisConnectionOptions,
  ): Promise<RedisClient> {
    const config = await this.getRedisSentinelOptions(clientMetadata, database, options);

    return new Promise((resolve, reject) => {
      try {
        const client = new Redis(config);
        client.on('error', (e): void => {
          this.logger.error('Failed connection to the redis oss sentinel', e);
          reject(e);
        });
        client.on('end', (): void => {
          this.logger.error(ERROR_MESSAGES.SERVER_CLOSED_CONNECTION);
          reject(new InternalServerErrorException(ERROR_MESSAGES.SERVER_CLOSED_CONNECTION));
        });
        client.on('ready', (): void => {
          this.logger.log('Successfully connected to the redis oss sentinel.');
          resolve(new SentinelIoredisClient(
            clientMetadata,
            client,
            {
              host: database.host,
              port: database.port,
            },
          ));
        });
      } catch (e) {
        reject(e);
      }
    });
  }
}
