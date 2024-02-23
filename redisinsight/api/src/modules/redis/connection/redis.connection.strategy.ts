import { ClientMetadata } from 'src/common/models';
import { Database } from 'src/modules/database/models/database';
import { SshTunnelProvider } from 'src/modules/ssh/ssh-tunnel.provider';
import { Injectable, Logger } from '@nestjs/common';
import { IRedisConnectionOptions } from 'src/modules/redis/redis.client.factory';
import { RedisClient } from 'src/modules/redis/client';
import { CONNECTION_NAME_GLOBAL_PREFIX } from 'src/constants';

@Injectable()
export abstract class RedisConnectionStrategy {
  protected logger = new Logger(this.constructor.name);

  constructor(
    protected readonly sshTunnelProvider: SshTunnelProvider,
  ) {}

  /**
   * Try to create standalone redis connection
   * @param clientMetadata
   * @param database
   * @param options
   */
  abstract createStandaloneClient(
    clientMetadata: ClientMetadata,
    database: Database,
    options: IRedisConnectionOptions,
  ): Promise<RedisClient>;

  /**
   * Try to create redis cluster connection
   * @param clientMetadata
   * @param database
   * @param options
   */
  abstract createClusterClient(
    clientMetadata: ClientMetadata,
    database: Database,
    options: IRedisConnectionOptions,
  ): Promise<RedisClient>;

  /**
   * Try to create redis sentinel connection
   * @param clientMetadata
   * @param database
   * @param options
   */
  abstract createSentinelClient(
    clientMetadata: ClientMetadata,
    database: Database,
    options: IRedisConnectionOptions,
  ): Promise<RedisClient>;

  /**
   * Generates client name based on clientMetadata fields
   * redisinsight-<context>-<databaseId{8}>-[dbIndex]-[uniqueId{4}]-[userId{4}]-[sessionId{4}]-[sessionUniqueId{4}]
   * Examples:
   *  cli: redisinsight-cli-658a47c1-0-fa32-de45-457a-
   *  browser: redisinsight-browser-658a47c1-0--de45-457a-
   * @param clientMetadata
   */
  static generateRedisConnectionName(clientMetadata: ClientMetadata) {
    try {
      const items = [
        CONNECTION_NAME_GLOBAL_PREFIX,
        clientMetadata?.context || 'custom',
        clientMetadata?.databaseId?.substring(0, 8),
      ];

      if (clientMetadata?.uniqueId) {
        items.push(clientMetadata?.uniqueId?.substring(0, 4));
      }

      return items.join('-').toLowerCase();

      // todo: enhance client name generation based on code below
      // return [
      //   CONNECTION_NAME_GLOBAL_PREFIX,
      //   clientMetadata?.context || 'custom',
      //   clientMetadata?.databaseId?.substring(0, 8),
      //   clientMetadata?.db >= 0 ? clientMetadata.db : '',
      //   clientMetadata?.uniqueId?.substring(0, 4) || '',
      //   clientMetadata?.sessionMetadata?.userId?.substring(0, 4) || '',
      //   clientMetadata?.sessionMetadata?.sessionId?.substring(0, 4) || '',
      //   clientMetadata?.sessionMetadata?.uniqueId?.substring(0, 4) || '',
      // ].join('-').toLowerCase();
    } catch (e) {
      return CONNECTION_NAME_GLOBAL_PREFIX;
    }
  }
}
