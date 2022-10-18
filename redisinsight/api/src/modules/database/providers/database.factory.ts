import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConnectionType } from 'src/modules/database/entities/database.entity';
import { catchRedisConnectionError, classToClass, getHostingProvider } from 'src/utils';
import { Database } from 'src/modules/database/models/database';
import * as IORedis from 'ioredis';
import { AppTool, RedisClusterNodeLinkState } from 'src/models';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { RedisService } from 'src/modules/core/services/redis/redis.service';
import { DatabaseInfoProvider } from 'src/modules/database/providers/database-info.provider';
import { DatabaseAnalytics } from 'src/modules/database/database.analytics';
import { RedisErrorCodes } from 'src/constants';
import { CaCertificateService } from 'src/modules/certificate/ca-certificate.service';
import { ClientCertificateService } from 'src/modules/certificate/client-certificate.service';
import { RedisSentinelBusinessService } from 'src/modules/shared/services/redis-sentinel-business/redis-sentinel-business.service';

@Injectable()
export class DatabaseFactory {
  private readonly logger = new Logger('DatabaseFactory');

  constructor(
    private redisService: RedisService,
    private redisSentinelService: RedisSentinelBusinessService,
    private databaseInfoProvider: DatabaseInfoProvider,
    private caCertificateService: CaCertificateService,
    private clientCertificateService: ClientCertificateService,
    private analytics: DatabaseAnalytics,
  ) {}

  /**
   * Create model
   * @param database
   */
  async createDatabaseModel(database: Database): Promise<Database> {
    let model;

    const client = await this.redisService.createStandaloneClient(
      database,
      AppTool.Common,
      false,
    );

    if (await this.databaseInfoProvider.isSentinel(client)) {
      if (!database.sentinelMaster) {
        throw new Error(RedisErrorCodes.SentinelParamsRequired);
      }
      model = await this.createSentinelDatabaseModel(database, client);
    } else if (await this.databaseInfoProvider.isCluster(client)) {
      model = await this.createClusterDatabaseModel(database, client);
    } else {
      model = await this.createStandaloneDatabaseModel(database);
    }

    model.modules = await this.databaseInfoProvider.determineDatabaseModules(client);
    await client.disconnect();

    // const result = convertEntityToDto(await this.databasesProvider.save(databaseEntity));
    // const redisInfo = await this.getInfo(result.id, AppTool.Common, true);
    // this.instancesAnalyticsService.sendInstanceAddedEvent(result, redisInfo);
    // return result;
    return model;

    // this.logger.error('Failed to add database.', error);
    // // const exception = getRedisConnectionException(error, dto);
    // // this.instancesAnalyticsService.sendInstanceAddFailedEvent(exception);
    // // throw exception;
    // throw error;

  }

  /**
   * Determines provider and creates or fetches certificates
   * Creates database model for standalone connection type
   * This method is a parent one for other databases types (CLUSTER, SENTINEL)
   * @param database
   * @private
   */
  private async createStandaloneDatabaseModel(database: Database): Promise<Database> {
    const model = database;

    model.connectionType = ConnectionType.STANDALONE;

    if (!model.provider) {
      model.provider = getHostingProvider(model.host);
    }

    if (model.caCert?.id && !model.caCert?.certificate) {
      // load ca cert by id
      model.caCert = await this.caCertificateService.get(model.caCert?.id);
    } else if (!model.caCert?.id && model.caCert?.certificate) {
      // create new ca cert
      model.caCert = await this.caCertificateService.create(model.caCert);
    }

    if (model.clientCert?.id && !model.clientCert?.certificate) {
      // load client cert by id
      model.clientCert = await this.clientCertificateService.get(model.clientCert?.id);
    } else if (!model.clientCert?.id && model.clientCert?.certificate) {
      // create new client cert
      model.clientCert = await this.clientCertificateService.create(model.clientCert);
    }

    return model;
  }

  /**
   * Fetches cluster nodes
   * Creates cluster client to validate connection. Disconnect after check
   * Creates database model for cluster connection type
   * @param database
   * @param client
   * @private
   */
  private async createClusterDatabaseModel(database: Database, client: IORedis.Redis): Promise<Database> {
    try {
      const model = database;

      model.nodes = await this.databaseInfoProvider.determineClusterNodes(client);

      const clusterClient = await this.redisService.createClusterClient(
        model,
        model.nodes,
      );

      // todo: rethink
      const primaryNodeOptions = clusterClient.nodes('master')[0].options;
      model.host = primaryNodeOptions.host;
      model.port = primaryNodeOptions.port;
      model.connectionType = ConnectionType.CLUSTER;

      await clusterClient.disconnect();

      return model;
    } catch (error) {
      this.logger.error('Failed to add oss cluster.', error);
      throw catchRedisConnectionError(error, database);
    }
  }

  /**
   * Fetches sentinel masters and align with defined one
   * Creates sentinel client to validate connection. Disconnect after check
   * Creates database model for cluster connection type
   * @param database
   * @param client
   * @private
   */
  private async createSentinelDatabaseModel(database: Database, client: IORedis.Redis): Promise<Database> {
    try {
      const model = database;
      const masters = await this.redisSentinelService.getMasters(client);
      const selectedMaster = masters.find(
        (master) => master.name === model.sentinelMaster.name,
      );

      if (!selectedMaster) {
        return Promise.reject(
          new NotFoundException(ERROR_MESSAGES.MASTER_GROUP_NOT_EXIST),
        );
      }

      const sentinelClient = await this.redisService.createSentinelClient(
        model,
        selectedMaster.endpoints,
        AppTool.Common,
      );

      model.connectionType = ConnectionType.SENTINEL;
      model.nodes = selectedMaster.endpoints;
      await sentinelClient.disconnect();

      return model;
    } catch (error) {
      this.logger.error('Failed to create database sentinel model.', error);
      throw catchRedisConnectionError(error, database);
    }
  }
}
