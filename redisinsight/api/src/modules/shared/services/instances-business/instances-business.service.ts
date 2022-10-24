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
import * as IORedis from 'ioredis';
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
  ConnectionType,
  DatabaseEntity,
  HostingProvider,
} from 'src/modules/database/entities/database.entity';
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
import { RedisDatabaseInfoResponse } from 'src/modules/instances/dto/redis-info.dto';
import { InstancesAnalyticsService } from 'src/modules/shared/services/instances-business/instances-analytics.service';
import { DatabasesProvider } from 'src/modules/shared/services/instances-business/databases.provider';
import { CaCertificateService } from 'src/modules/certificate/ca-certificate.service';
import { ClientCertificateService } from 'src/modules/certificate/client-certificate.service';
import { convertEntityToDto } from '../../utils/database-entity-converter';
import { RedisEnterpriseBusinessService } from '../redis-enterprise-business/redis-enterprise-business.service';
import { RedisCloudBusinessService } from '../redis-cloud-business/redis-cloud-business.service';
import { ConfigurationBusinessService } from '../configuration-business/configuration-business.service';

@Injectable()
export class InstancesBusinessService {
  private logger = new Logger('InstancesBusinessService');

  constructor(
    @InjectRepository(DatabaseEntity)
    private instanceRepository: Repository<DatabaseEntity>,
    private databasesProvider: DatabasesProvider,
    private redisService: RedisService,
    private caCertificateService: CaCertificateService,
    private clientCertificateService: ClientCertificateService,
    private redisEnterpriseService: RedisEnterpriseBusinessService,
    private redisCloudService: RedisCloudBusinessService,
    private redisConfBusinessService: ConfigurationBusinessService,
    private instancesAnalyticsService: InstancesAnalyticsService,
    private eventEmitter: EventEmitter2,
  ) {}
  //
  // public async addRedisEnterpriseDatabases(
  //   connectionDetails: ClusterConnectionDetailsDto,
  //   uids: number[],
  // ): Promise<AddRedisEnterpriseDatabaseResponse[]> {
  //   this.logger.log('Adding Redis Enterprise databases.');
  //   let result: AddRedisEnterpriseDatabaseResponse[];
  //   try {
  //     const databases: RedisEnterpriseDatabase[] = await this.redisEnterpriseService.getDatabases(
  //       connectionDetails,
  //     );
  //     result = await Promise.all(
  //       uids.map(
  //         async (uid): Promise<AddRedisEnterpriseDatabaseResponse> => {
  //           const database = databases.find(
  //             (db: RedisEnterpriseDatabase) => db.uid === uid,
  //           );
  //           if (!database) {
  //             const exception = new NotFoundException();
  //             return {
  //               uid,
  //               status: AddRedisDatabaseStatus.Fail,
  //               message: exception.message,
  //               error: exception?.getResponse(),
  //             };
  //           }
  //           try {
  //             const {
  //               port, name, dnsName, password,
  //             } = database;
  //             const host = connectionDetails.host === 'localhost' ? 'localhost' : dnsName;
  //             delete database.password;
  //             await this.addDatabase({
  //               host,
  //               port,
  //               name,
  //               nameFromProvider: name,
  //               password,
  //               provider: HostingProvider.RE_CLUSTER,
  //             });
  //             return {
  //               uid,
  //               status: AddRedisDatabaseStatus.Success,
  //               message: 'Added',
  //               databaseDetails: database,
  //             };
  //           } catch (error) {
  //             return {
  //               uid,
  //               status: AddRedisDatabaseStatus.Fail,
  //               message: error.message,
  //               databaseDetails: database,
  //               error: error?.response,
  //             };
  //           }
  //         },
  //       ),
  //     );
  //   } catch (error) {
  //     this.logger.error('Failed to add Redis Enterprise databases', error);
  //     throw error;
  //   }
  //   return result;
  // }

  // public async addRedisCloudDatabases(
  //   auth: CloudAuthDto,
  //   addDatabasesDto: AddRedisCloudDatabaseDto[],
  // ): Promise<AddRedisCloudDatabaseResponse[]> {
  //   this.logger.log('Adding Redis Cloud databases.');
  //   let result: AddRedisCloudDatabaseResponse[];
  //   try {
  //     result = await Promise.all(
  //       addDatabasesDto.map(
  //         async (
  //           dto: AddRedisCloudDatabaseDto,
  //         ): Promise<AddRedisCloudDatabaseResponse> => {
  //           const database = await this.redisCloudService.getDatabase({
  //             ...auth,
  //             ...dto,
  //           });
  //           try {
  //             const {
  //               publicEndpoint, name, password, status,
  //             } = database;
  //             if (status !== RedisEnterpriseDatabaseStatus.Active) {
  //               const exception = new ServiceUnavailableException(ERROR_MESSAGES.DATABASE_IS_INACTIVE);
  //               return {
  //                 ...dto,
  //                 status: AddRedisDatabaseStatus.Fail,
  //                 message: exception.message,
  //                 error: exception?.getResponse(),
  //                 databaseDetails: database,
  //               };
  //             }
  //             const [host, port] = publicEndpoint.split(':');
  //             await this.addDatabase({
  //               host,
  //               port: parseInt(port, 10),
  //               name,
  //               nameFromProvider: name,
  //               password,
  //               provider: HostingProvider.RE_CLOUD,
  //             });
  //             return {
  //               ...dto,
  //               status: AddRedisDatabaseStatus.Success,
  //               message: 'Added',
  //               databaseDetails: database,
  //             };
  //           } catch (error) {
  //             return {
  //               ...dto,
  //               status: AddRedisDatabaseStatus.Fail,
  //               message: error.message,
  //               error: error?.response,
  //               databaseDetails: database,
  //             };
  //           }
  //         },
  //       ),
  //     );
  //   } catch (error) {
  //     this.logger.error('Failed to add Redis Cloud databases.', error);
  //     throw error;
  //   }
  //   return result;
  // }

  // public async addSentinelMasters(
  //   dto: AddSentinelMastersDto,
  // ): Promise<AddSentinelMasterResponse[]> {
  //   this.logger.log('Adding Sentinel masters.');
  //   const result: AddSentinelMasterResponse[] = [];
  //   const { masters, ...connectionOptions } = dto;
  //   try {
  //     const client = await this.redisService.createStandaloneClient(
  //       connectionOptions,
  //       AppTool.Common,
  //       false,
  //     );
  //     const isOssSentinel = await this.redisConfBusinessService.checkSentinelConnection(
  //       client,
  //     );
  //     if (!isOssSentinel) {
  //       await client.disconnect();
  //       this.logger.error(
  //         `Failed to add Sentinel masters. ${ERROR_MESSAGES.WRONG_DATABASE_TYPE}.`,
  //       );
  //       const exception = new BadRequestException(
  //         ERROR_MESSAGES.WRONG_DATABASE_TYPE,
  //       );
  //       this.instancesAnalyticsService.sendInstanceAddFailedEvent(exception);
  //       return Promise.reject(exception);
  //     }
  //
  //     await Promise.all(masters.map(async (master) => {
  //       const {
  //         alias, name, password, username, db,
  //       } = master;
  //       const addedMasterGroup = find(result, {
  //         status: AddRedisDatabaseStatus.Success,
  //       });
  //       try {
  //         const databaseEntity = await this.createSentinelDatabaseEntity(
  //           {
  //             ...connectionOptions,
  //             tls: addedMasterGroup?.instance?.tls || connectionOptions.tls,
  //             name: alias,
  //             db,
  //             sentinelMaster: {
  //               name,
  //               username,
  //               password,
  //             },
  //           },
  //           client,
  //         );
  //         const instance = convertEntityToDto(
  //           await this.databasesProvider.save(databaseEntity),
  //         );
  //         const redisInfo = await this.getInfo(instance.id);
  //         this.instancesAnalyticsService.sendInstanceAddedEvent(
  //           instance,
  //           redisInfo,
  //         );
  //         result.push({
  //           id: instance.id,
  //           name,
  //           instance,
  //           status: AddRedisDatabaseStatus.Success,
  //           message: 'Added',
  //         });
  //       } catch (error) {
  //         this.instancesAnalyticsService.sendInstanceAddFailedEvent(error);
  //         result.push({
  //           name,
  //           status: AddRedisDatabaseStatus.Fail,
  //           message: error?.response?.message,
  //           error: error?.response,
  //         });
  //       }
  //     }));
  //
  //     await client.disconnect();
  //     return result.map(
  //       (item: AddSentinelMasterResponse): AddSentinelMasterResponse => omit(item, 'instance'),
  //     );
  //   } catch (error) {
  //     this.logger.error('Failed to add Sentinel masters.', error);
  //     const exception = getRedisConnectionException(error, connectionOptions);
  //     this.instancesAnalyticsService.sendInstanceAddFailedEvent(exception);
  //     throw exception;
  //   }
  // }
}
