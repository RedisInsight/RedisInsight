import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import IORedis from 'ioredis';
import { find, omit } from 'lodash';
import { AppRedisInstanceEvents, RedisErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';
import {
  catchRedisConnectionError,
  generateRedisConnectionName,
  getHostingProvider,
  getRedisConnectionException,
} from 'src/utils';
import { AppTool, RedisClusterNodeLinkState } from 'src/models';
import { RedisService } from 'src/modules/core/services/redis/redis.service';
import {
  CaCertBusinessService,
} from 'src/modules/core/services/certificates/ca-cert-business/ca-cert-business.service';
import {
  ClientCertBusinessService,
} from 'src/modules/core/services/certificates/client-cert-business/client-cert-business.service';
import {
  ConnectionType,
  DatabaseInstanceEntity,
  HostingProvider,
} from 'src/modules/core/models/database-instance.entity';
import {
  AddDatabaseInstanceDto,
  DatabaseInstanceResponse,
  DeleteDatabaseInstanceResponse,
  RenameDatabaseInstanceResponse,
} from 'src/modules/instances/dto/database-instance.dto';
import {
  ClusterConnectionDetailsDto,
  RedisEnterpriseDatabase,
} from 'src/modules/redis-enterprise/dto/cluster.dto';
import {
  AddRedisDatabaseStatus,
  AddRedisEnterpriseDatabaseResponse,
} from 'src/modules/instances/dto/redis-enterprise-cluster.dto';
import { CloudAuthDto } from 'src/modules/redis-enterprise/dto/cloud.dto';
import {
  AddRedisCloudDatabaseDto,
  AddRedisCloudDatabaseResponse,
} from 'src/modules/instances/dto/redis-enterprise-cloud.dto';
import { RedisEnterpriseDatabaseStatus } from 'src/modules/redis-enterprise/models/redis-enterprise-database';
import {
  AddSentinelMasterResponse,
  AddSentinelMastersDto,
} from 'src/modules/instances/dto/redis-sentinel.dto';
import { RedisDatabaseInfoResponse } from 'src/modules/instances/dto/redis-info.dto';
import { InstancesAnalyticsService } from 'src/modules/shared/services/instances-business/instances-analytics.service';
import { OverviewService } from 'src/modules/shared/services/instances-business/overview.service';
import { DatabaseOverview } from 'src/modules/instances/dto/database-overview.dto';
import { DatabasesProvider } from 'src/modules/shared/services/instances-business/databases.provider';
import { convertEntityToDto } from '../../utils/database-entity-converter';
import { RedisEnterpriseBusinessService } from '../redis-enterprise-business/redis-enterprise-business.service';
import { RedisCloudBusinessService } from '../redis-cloud-business/redis-cloud-business.service';
import { ConfigurationBusinessService } from '../configuration-business/configuration-business.service';
import { RedisSentinelBusinessService } from '../redis-sentinel-business/redis-sentinel-business.service';

@Injectable()
export class InstancesBusinessService {
  private logger = new Logger('InstancesBusinessService');

  constructor(
    @InjectRepository(DatabaseInstanceEntity)
    private instanceRepository: Repository<DatabaseInstanceEntity>,
    private databasesProvider: DatabasesProvider,
    private redisService: RedisService,
    private caCertBusinessService: CaCertBusinessService,
    private clientCertBusinessService: ClientCertBusinessService,
    private redisEnterpriseService: RedisEnterpriseBusinessService,
    private redisCloudService: RedisCloudBusinessService,
    private redisSentinelService: RedisSentinelBusinessService,
    private redisConfBusinessService: ConfigurationBusinessService,
    private overviewService: OverviewService,
    private instancesAnalyticsService: InstancesAnalyticsService,
    private eventEmitter: EventEmitter2,
  ) {}

  async exists(id: string) {
    this.logger.log(`Checking if database with ${id} exists.`);
    return this.databasesProvider.exists(id);
  }

  async getAll(): Promise<DatabaseInstanceResponse[]> {
    try {
      const result = (await this.databasesProvider.getAll()).map(convertEntityToDto);
      this.instancesAnalyticsService.sendInstanceListReceivedEvent(result);
      return result;
    } catch (error) {
      this.logger.error('Failed to get database instance list.', error);
      throw new InternalServerErrorException();
    }
  }

  async getOneById(id: string): Promise<DatabaseInstanceResponse> {
    return convertEntityToDto(await this.databasesProvider.getOneById(id));
  }

  async addDatabase(
    databaseDto: AddDatabaseInstanceDto,
  ): Promise<DatabaseInstanceResponse> {
    this.logger.log('Adding database.');
    try {
      let databaseEntity: DatabaseInstanceEntity;
      const client = await this.redisService.createStandaloneClient(
        databaseDto,
        AppTool.Common,
        false,
      );
      const isOssCluster = await this.redisConfBusinessService.checkClusterConnection(client);
      const isOssSentinel = await this.redisConfBusinessService.checkSentinelConnection(client);
      if (isOssSentinel) {
        if (!databaseDto.sentinelMaster) {
          throw new Error(RedisErrorCodes.SentinelParamsRequired);
        }
        databaseEntity = await this.createSentinelDatabaseEntity(databaseDto, client);
      } else if (isOssCluster) {
        databaseEntity = await this.createClusterDatabaseEntity(databaseDto, client);
      } else {
        databaseEntity = await this.createDatabaseEntity(databaseDto);
        databaseEntity.connectionType = ConnectionType.STANDALONE;
      }
      const modules = await this.redisConfBusinessService.getLoadedModulesList(client);
      databaseEntity.modules = JSON.stringify(modules);
      await client.disconnect();
      const result = convertEntityToDto(await this.databasesProvider.save(databaseEntity));
      const redisInfo = await this.getInfo(result.id, AppTool.Common, true);
      this.instancesAnalyticsService.sendInstanceAddedEvent(result, redisInfo);
      return result;
    } catch (error) {
      this.logger.error('Failed to add database.', error);
      const exception = getRedisConnectionException(error, databaseDto);
      this.instancesAnalyticsService.sendInstanceAddFailedEvent(exception);
      throw exception;
    }
  }

  // todo: remove manualUpdate flag logic
  async update(
    id: string,
    databaseDto: AddDatabaseInstanceDto,
    manualUpdate: boolean = true,
  ): Promise<DatabaseInstanceResponse> {
    this.logger.log(`Updating database instance. id: ${id}`);
    const oldEntity = await this.databasesProvider.getOneById(id, true);

    try {
      let databaseEntity;
      const client = await this.redisService.createStandaloneClient(
        databaseDto,
        AppTool.Common,
        false,
      );
      const isOssSentinel = await this.redisConfBusinessService.checkSentinelConnection(
        client,
      );
      const isOssCluster = await this.redisConfBusinessService.checkClusterConnection(
        client,
      );
      if (isOssSentinel) {
        if (!databaseDto.sentinelMaster) {
          throw new Error('SENTINEL_PARAMS_REQUIRED');
        }
        databaseEntity = await this.createSentinelDatabaseEntity(databaseDto, client);
      } else if (isOssCluster) {
        databaseEntity = await this.createClusterDatabaseEntity(databaseDto, client);
      } else {
        databaseEntity = await this.createDatabaseEntity(databaseDto);
        databaseEntity.connectionType = ConnectionType.STANDALONE;
        databaseEntity.nodes = null;
        databaseEntity.sentinelMasterName = null;
        databaseEntity.sentinelMasterPassword = null;
        databaseEntity.sentinelMasterUsername = null;
      }
      const modules = await this.redisConfBusinessService.getLoadedModulesList(client);
      await client.disconnect();
      databaseEntity.modules = JSON.stringify(modules);
      if (manualUpdate) {
        databaseEntity.provider = getHostingProvider(databaseEntity.host);
      }

      await this.databasesProvider.update(id, databaseEntity);
      const instance = convertEntityToDto(await this.databasesProvider.getOneById(id));
      this.redisService.removeClientInstance({ instanceId: id });
      this.instancesAnalyticsService.sendInstanceEditedEvent(
        convertEntityToDto(oldEntity),
        instance,
        manualUpdate,
      );
      return instance;
    } catch (error) {
      this.logger.error(`Failed to update database instance ${id}`, error);
      throw catchRedisConnectionError(error, databaseDto);
    }
  }

  async delete(id: string): Promise<void> {
    this.logger.log(`Deleting database instance. id: ${id}`);
    const instance = await this.databasesProvider.getOneById(id, true);
    try {
      await this.instanceRepository.delete(id);
      this.redisService.removeClientInstance({ instanceId: id });
      this.logger.log('Succeed to delete database instance.');

      this.instancesAnalyticsService.sendInstanceDeletedEvent(
        convertEntityToDto(instance),
      );
      this.eventEmitter.emit(AppRedisInstanceEvents.Deleted, id);
      return;
    } catch (error) {
      this.logger.error(`Failed to delete database instance ${id}`, error);
      throw new InternalServerErrorException();
    }
  }

  async bulkDelete(ids: string[]): Promise<DeleteDatabaseInstanceResponse> {
    this.logger.log(`Deleting many database instances. ids: ${ids}`);
    try {
      const instances = await this.instanceRepository.findByIds(ids);
      instances.forEach((item: DatabaseInstanceEntity) => {
        this.redisService.removeClientInstance({ instanceId: item.id });
        this.instancesAnalyticsService.sendInstanceDeletedEvent(
          convertEntityToDto(item),
        );
        this.eventEmitter.emit(AppRedisInstanceEvents.Deleted, item.id);
      });
      const res = await this.instanceRepository.remove(instances);
      this.logger.log(`Succeed to delete many database instances. Affected: ${res.length}`);
      return { affected: res.length };
    } catch (error) {
      this.logger.error('Failed to delete many database instances', error);
      throw new InternalServerErrorException();
    }
  }

  async connectToInstance(
    id: string,
    tool = AppTool.Common,
    storeClientInstance = false,
  ): Promise<IORedis.Redis | IORedis.Cluster> {
    this.logger.log(`Connecting to database instance. id: ${id}`);
    const instance = convertEntityToDto(await this.databasesProvider.getOneById(id));
    const connectionName = generateRedisConnectionName(tool, id);

    try {
      const client = await this.redisService.connectToDatabaseInstance(
        instance,
        tool,
        connectionName,
      );

      // refresh modules list and last connected time
      // will be refreshed after user navigate to particular database from the databases list
      // Note: move to a different place in case if we need to update such info more often
      const modules = await this.redisConfBusinessService.getLoadedModulesList(client);
      await this.databasesProvider.patch(id, {
        lastConnection: new Date().toISOString(),
        modules: JSON.stringify(modules),
      });

      if (storeClientInstance) {
        await this.redisService.setClientInstance(
          {
            uuid: instance.id,
            instanceId: instance.id,
            tool,
          },
          client,
        );
      }
      this.logger.log(`Succeed connection to database instance. id: ${id}`);
      return client;
    } catch (error) {
      this.logger.error(`Failed connection to database instance ${id}`, error);
      const exception = getRedisConnectionException(
        error,
        instance,
        instance.name,
      );
      this.instancesAnalyticsService.sendConnectionFailedEvent(instance, exception);
      throw exception;
    }
  }

  /**
   * Get redis database overview
   *
   * @param instanceId
   */
  public async getOverview(instanceId: string): Promise<DatabaseOverview> {
    this.logger.log(`Getting database ${instanceId} overview`);

    const tool = AppTool.Common;

    let client = this.redisService.getClientInstance({ instanceId, tool })?.client;
    if (!client || !this.redisService.isClientConnected(client)) {
      client = await this.connectToInstance(instanceId, tool, true);
    }
    return this.overviewService.getOverview(instanceId, client);
  }

  public async getInfo(
    instanceId: string,
    tool = AppTool.Common,
    storeClientInstance = false,
  ): Promise<RedisDatabaseInfoResponse> {
    let info: RedisDatabaseInfoResponse;
    this.logger.log(`Getting redis info. id: ${instanceId}`);

    let client = this.redisService.getClientInstance({ instanceId, tool })?.client;
    if (!client || !this.redisService.isClientConnected(client)) {
      client = await this.connectToInstance(instanceId, tool, storeClientInstance);
      info = await this.redisConfBusinessService.getRedisGeneralInfo(client);
      if (!storeClientInstance) {
        await client.disconnect();
      }
    } else {
      info = await this.redisConfBusinessService.getRedisGeneralInfo(client);
    }
    return info;
  }

  async rename(
    id: string,
    newName: string,
  ): Promise<RenameDatabaseInstanceResponse> {
    this.logger.log(`Rename database instance. id: ${id}`);
    const { name: oldName } = await this.databasesProvider.getOneById(id, true);

    try {
      await this.databasesProvider.patch(id, { name: newName });
      this.logger.log('Succeed to rename database instance.');
      return { oldName, newName };
    } catch (error) {
      this.logger.error(`Failed to rename database instance ${id}`, error);
      throw new InternalServerErrorException();
    }
  }

  public async addRedisEnterpriseDatabases(
    connectionDetails: ClusterConnectionDetailsDto,
    uids: number[],
  ): Promise<AddRedisEnterpriseDatabaseResponse[]> {
    this.logger.log('Adding Redis Enterprise databases.');
    let result: AddRedisEnterpriseDatabaseResponse[];
    try {
      const databases: RedisEnterpriseDatabase[] = await this.redisEnterpriseService.getDatabases(
        connectionDetails,
      );
      result = await Promise.all(
        uids.map(
          async (uid): Promise<AddRedisEnterpriseDatabaseResponse> => {
            const database = databases.find(
              (db: RedisEnterpriseDatabase) => db.uid === uid,
            );
            if (!database) {
              const exception = new NotFoundException();
              return {
                uid,
                status: AddRedisDatabaseStatus.Fail,
                message: exception.message,
                error: exception?.getResponse(),
              };
            }
            try {
              const {
                port, name, dnsName, password,
              } = database;
              const host = connectionDetails.host === 'localhost' ? 'localhost' : dnsName;
              delete database.password;
              await this.addDatabase({
                host,
                port,
                name,
                nameFromProvider: name,
                password,
                provider: HostingProvider.RE_CLUSTER,
              });
              return {
                uid,
                status: AddRedisDatabaseStatus.Success,
                message: 'Added',
                databaseDetails: database,
              };
            } catch (error) {
              return {
                uid,
                status: AddRedisDatabaseStatus.Fail,
                message: error.message,
                databaseDetails: database,
                error: error?.response,
              };
            }
          },
        ),
      );
    } catch (error) {
      this.logger.error('Failed to add Redis Enterprise databases', error);
      throw error;
    }
    return result;
  }

  public async addRedisCloudDatabases(
    auth: CloudAuthDto,
    addDatabasesDto: AddRedisCloudDatabaseDto[],
  ): Promise<AddRedisCloudDatabaseResponse[]> {
    this.logger.log('Adding Redis Cloud databases.');
    let result: AddRedisCloudDatabaseResponse[];
    try {
      result = await Promise.all(
        addDatabasesDto.map(
          async (
            dto: AddRedisCloudDatabaseDto,
          ): Promise<AddRedisCloudDatabaseResponse> => {
            const database = await this.redisCloudService.getDatabase({
              ...auth,
              ...dto,
            });
            try {
              const {
                publicEndpoint, name, password, status,
              } = database;
              if (status !== RedisEnterpriseDatabaseStatus.Active) {
                const exception = new ServiceUnavailableException(ERROR_MESSAGES.DATABASE_IS_INACTIVE);
                return {
                  ...dto,
                  status: AddRedisDatabaseStatus.Fail,
                  message: exception.message,
                  error: exception?.getResponse(),
                  databaseDetails: database,
                };
              }
              const [host, port] = publicEndpoint.split(':');
              await this.addDatabase({
                host,
                port: parseInt(port, 10),
                name,
                nameFromProvider: name,
                password,
                provider: HostingProvider.RE_CLOUD,
              });
              return {
                ...dto,
                status: AddRedisDatabaseStatus.Success,
                message: 'Added',
                databaseDetails: database,
              };
            } catch (error) {
              return {
                ...dto,
                status: AddRedisDatabaseStatus.Fail,
                message: error.message,
                error: error?.response,
                databaseDetails: database,
              };
            }
          },
        ),
      );
    } catch (error) {
      this.logger.error('Failed to add Redis Cloud databases.', error);
      throw error;
    }
    return result;
  }

  public async addSentinelMasters(
    dto: AddSentinelMastersDto,
  ): Promise<AddSentinelMasterResponse[]> {
    this.logger.log('Adding Sentinel masters.');
    const result: AddSentinelMasterResponse[] = [];
    const { masters, ...connectionOptions } = dto;
    try {
      const client = await this.redisService.createStandaloneClient(
        connectionOptions,
        AppTool.Common,
        false,
      );
      const isOssSentinel = await this.redisConfBusinessService.checkSentinelConnection(
        client,
      );
      if (!isOssSentinel) {
        await client.disconnect();
        this.logger.error(
          `Failed to add Sentinel masters. ${ERROR_MESSAGES.WRONG_DATABASE_TYPE}.`,
        );
        const exception = new BadRequestException(
          ERROR_MESSAGES.WRONG_DATABASE_TYPE,
        );
        this.instancesAnalyticsService.sendInstanceAddFailedEvent(exception);
        return Promise.reject(exception);
      }

      await Promise.all(masters.map(async (master) => {
        const {
          alias, name, password, username, db,
        } = master;
        const addedMasterGroup = find(result, {
          status: AddRedisDatabaseStatus.Success,
        });
        try {
          const databaseEntity = await this.createSentinelDatabaseEntity(
            {
              ...connectionOptions,
              tls: addedMasterGroup?.instance?.tls || connectionOptions.tls,
              name: alias,
              db,
              sentinelMaster: {
                name,
                username,
                password,
              },
            },
            client,
          );
          const instance = convertEntityToDto(
            await this.databasesProvider.save(databaseEntity),
          );
          const redisInfo = await this.getInfo(instance.id);
          this.instancesAnalyticsService.sendInstanceAddedEvent(
            instance,
            redisInfo,
          );
          result.push({
            id: instance.id,
            name,
            instance,
            status: AddRedisDatabaseStatus.Success,
            message: 'Added',
          });
        } catch (error) {
          this.instancesAnalyticsService.sendInstanceAddFailedEvent(error);
          result.push({
            name,
            status: AddRedisDatabaseStatus.Fail,
            message: error?.response?.message,
            error: error?.response,
          });
        }
      }));

      await client.disconnect();
      return result.map(
        (item: AddSentinelMasterResponse): AddSentinelMasterResponse => omit(item, 'instance'),
      );
    } catch (error) {
      this.logger.error('Failed to add Sentinel masters.', error);
      const exception = getRedisConnectionException(error, connectionOptions);
      this.instancesAnalyticsService.sendInstanceAddFailedEvent(exception);
      throw exception;
    }
  }

  public async createDatabaseEntity(
    databaseDto: AddDatabaseInstanceDto,
    storeCert: boolean = true,
  ): Promise<DatabaseInstanceEntity> {
    const { tls, provider, ...rest } = databaseDto;
    const database: DatabaseInstanceEntity = this.instanceRepository.create({
      username: null,
      password: null,
      provider: provider || getHostingProvider(rest.host),
      ...rest,
    });
    database.tls = !!tls;
    if (storeCert && database.tls) {
      database.verifyServerCert = tls.verifyServerCert;
      if (tls.newCaCert) {
        database.caCert = await this.caCertBusinessService.create(
          tls.newCaCert,
        );
      } else if (tls.caCertId) {
        database.caCert = await this.caCertBusinessService.getOneById(
          tls.caCertId,
        );
      }
      if (tls.newClientCertPair) {
        database.clientCert = await this.clientCertBusinessService.create(
          tls.newClientCertPair,
        );
      } else if (tls.clientCertPairId) {
        database.clientCert = await this.clientCertBusinessService.getOneById(
          tls.clientCertPairId,
        );
      }
    } else {
      database.verifyServerCert = false;
      database.caCert = null;
      database.clientCert = null;
    }
    return database;
  }

  async createClusterDatabaseEntity(
    databaseDto: AddDatabaseInstanceDto,
    client: IORedis.Redis,
  ): Promise<DatabaseInstanceEntity> {
    this.logger.log('Adding oss cluster.');
    try {
      const nodes = (
        await this.redisConfBusinessService.getRedisClusterNodes(client)
      ).filter(
        (node) => node.linkState === RedisClusterNodeLinkState.Connected,
      );
      const nodeAddresses = nodes.map((node) => ({
        host: node.host,
        port: node.port,
      }));
      const clusterClient = await this.redisService.createClusterClient(
        databaseDto,
        nodeAddresses,
      );
      const primaryNodeOptions = clusterClient.nodes('master')[0].options;
      const databaseEntity = await this.createDatabaseEntity({
        ...databaseDto,
        host: primaryNodeOptions.host,
        port: primaryNodeOptions.port,
      });
      databaseEntity.connectionType = ConnectionType.CLUSTER;
      databaseEntity.nodes = JSON.stringify(nodeAddresses);
      await clusterClient.disconnect();
      return databaseEntity;
    } catch (error) {
      this.logger.error('Failed to add oss cluster.', error);
      throw catchRedisConnectionError(error, databaseDto);
    }
  }

  async createSentinelDatabaseEntity(
    databaseDto: AddDatabaseInstanceDto,
    client: IORedis.Redis,
  ): Promise<DatabaseInstanceEntity> {
    this.logger.log('Adding oss sentinel.');
    try {
      const { sentinelMaster } = databaseDto;
      const masters = await this.redisSentinelService.getMasters(client);
      const selectedMaster = masters.find(
        (master) => master.name === sentinelMaster.name,
      );
      if (!selectedMaster) {
        return Promise.reject(
          new NotFoundException(ERROR_MESSAGES.MASTER_GROUP_NOT_EXIST),
        );
      }
      const sentinelClient = await this.redisService.createSentinelClient(
        databaseDto,
        selectedMaster.endpoints,
        AppTool.Common,
      );
      const databaseEntity = await this.createDatabaseEntity({
        ...databaseDto,
      });
      databaseEntity.connectionType = ConnectionType.SENTINEL;
      databaseEntity.nodes = JSON.stringify(selectedMaster.endpoints);
      databaseEntity.sentinelMasterName = sentinelMaster.name;
      databaseEntity.sentinelMasterUsername = sentinelMaster.username;
      databaseEntity.sentinelMasterPassword = sentinelMaster.password;
      await sentinelClient.disconnect();
      return databaseEntity;
    } catch (error) {
      this.logger.error('Failed to add oss sentinel.', error);
      throw catchRedisConnectionError(error, databaseDto);
    }
  }
}
