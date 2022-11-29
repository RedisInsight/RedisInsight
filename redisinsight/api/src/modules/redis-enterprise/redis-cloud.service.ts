import {
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException, ServiceUnavailableException,
} from '@nestjs/common';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { get, find, uniq } from 'lodash';
import config from 'src/utils/config';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { IRedisCloudAccount } from 'src/modules/redis-enterprise/models/redis-cloud-account';
import {
  CloudAuthDto,
  GetCloudAccountShortInfoResponse,
  GetDatabaseInCloudSubscriptionDto,
  GetDatabasesInCloudSubscriptionDto,
  GetDatabasesInMultipleCloudSubscriptionsDto,
  RedisCloudDatabase,
  GetRedisCloudSubscriptionResponse,
} from 'src/modules/redis-enterprise/dto/cloud.dto';
import { IRedisCloudSubscription } from 'src/modules/redis-enterprise/models/redis-cloud-subscriptions';
import {
  IRedisCloudDatabase,
  IRedisCloudDatabaseModule,
  IRedisCloudDatabasesResponse,
  RedisPersistencePolicy,
  RedisCloudDatabaseProtocol,
  RedisCloudMemoryStorage,
} from 'src/modules/redis-enterprise/models/redis-cloud-database';
import { convertRECloudModuleName } from 'src/modules/redis-enterprise/utils/redis-cloud-converter';
import { RedisEnterpriseAnalytics } from 'src/modules/redis-enterprise/redis-enterprise.analytics';
import {
  AddRedisCloudDatabaseDto,
  AddRedisCloudDatabaseResponse,
} from 'src/modules/redis-enterprise/dto/redis-enterprise-cloud.dto';
import { RedisEnterpriseDatabaseStatus } from 'src/modules/redis-enterprise/models/redis-enterprise-database';
import { DatabaseService } from 'src/modules/database/database.service';
import { HostingProvider } from 'src/modules/database/entities/database.entity';
import { ActionStatus } from 'src/common/models';

@Injectable()
export class RedisCloudService {
  private logger = new Logger('RedisCloudBusinessService');

  private config = config.get('redis_cloud');

  private api = axios.create();

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly analytics: RedisEnterpriseAnalytics,
  ) {}

  async getAccount(
    dto: CloudAuthDto,
  ): Promise<GetCloudAccountShortInfoResponse> {
    this.logger.log('Getting RE cloud account.');
    const { apiKey, apiSecretKey } = dto;
    try {
      const {
        data: { account },
      }: AxiosResponse = await this.api.get(`${this.config.url}/`, {
        headers: this.getAuthHeaders(apiKey, apiSecretKey),
      });
      this.logger.log('Succeed to get RE cloud account.');

      return this.parseCloudAccountResponse(account);
    } catch (error) {
      throw this.getApiError(error, 'Failed to get RE cloud account');
    }
  }

  async getSubscriptions(
    dto: CloudAuthDto,
  ): Promise<GetRedisCloudSubscriptionResponse[]> {
    this.logger.log('Getting RE cloud subscriptions.');
    const { apiKey, apiSecretKey } = dto;
    try {
      const {
        data: { subscriptions },
      }: AxiosResponse = await this.api.get(
        `${this.config.url}/subscriptions`,
        {
          headers: this.getAuthHeaders(apiKey, apiSecretKey),
        },
      );
      this.logger.log('Succeed to get RE cloud subscriptions.');
      const result = this.parseCloudSubscriptionsResponse(subscriptions);
      this.analytics.sendGetRECloudSubsSucceedEvent(result);
      return result;
    } catch (error) {
      const exception = this.getApiError(error, 'Failed to get RE cloud subscriptions');
      this.analytics.sendGetRECloudSubsFailedEvent(exception);
      throw exception;
    }
  }

  async getDatabasesInSubscription(
    dto: GetDatabasesInCloudSubscriptionDto,
  ): Promise<RedisCloudDatabase[]> {
    const { apiKey, apiSecretKey, subscriptionId } = dto;
    this.logger.log(
      `Getting databases in RE cloud subscription. subscription id: ${subscriptionId}`,
    );
    try {
      const { data }: AxiosResponse = await this.api.get(
        `${this.config.url}/subscriptions/${subscriptionId}/databases`,
        {
          headers: this.getAuthHeaders(apiKey, apiSecretKey),
        },
      );
      this.logger.log('Succeed to get databases in RE cloud subscription.');
      return this.parseCloudDatabasesInSubscriptionResponse(data);
    } catch (error) {
      const { response } = error;
      let exception: HttpException;
      if (response?.status === 404) {
        const message = `Subscription ${subscriptionId} not found`;
        this.logger.error(
          `Failed to get databases in RE cloud subscription. ${message}.`,
        );
        exception = new NotFoundException(message);
      } else {
        exception = this.getApiError(
          error,
          'Failed to get databases in RE cloud subscription',
        );
      }
      throw exception;
    }
  }

  async getDatabase(
    dto: GetDatabaseInCloudSubscriptionDto,
  ): Promise<RedisCloudDatabase> {
    const {
      apiKey, apiSecretKey, subscriptionId, databaseId,
    } = dto;
    this.logger.log(
      `Getting database in RE cloud subscription. subscription id: ${subscriptionId}, database id: ${databaseId}`,
    );
    try {
      const { data }: AxiosResponse = await this.api.get(
        `${this.config.url}/subscriptions/${subscriptionId}/databases/${databaseId}`,
        {
          headers: this.getAuthHeaders(apiKey, apiSecretKey),
        },
      );
      this.logger.log('Succeed to get databases in RE cloud subscription.');
      return this.parseCloudDatabaseResponse(data, subscriptionId);
    } catch (error) {
      const { response } = error;
      if (response?.status === 404) {
        this.logger.error(
          `Failed to get databases in RE cloud subscription. ${response?.data?.message}.`,
        );
        throw new NotFoundException(response?.data?.message);
      }
      throw this.getApiError(
        error,
        'Failed to get databases in RE cloud subscription',
      );
    }
  }

  async getDatabasesInMultipleSubscriptions(
    dto: GetDatabasesInMultipleCloudSubscriptionsDto,
  ): Promise<RedisCloudDatabase[]> {
    const { apiKey, apiSecretKey } = dto;
    const subscriptionIds = uniq(dto.subscriptionIds);
    this.logger.log('Getting databases in RE cloud subscriptions.');
    let result = [];
    try {
      await Promise.all(
        subscriptionIds.map(async (subscriptionId: number) => {
          const databases = await this.getDatabasesInSubscription({
            apiKey,
            apiSecretKey,
            subscriptionId,
          });
          result = [...result, ...databases];
        }),
      );
      this.analytics.sendGetRECloudDbsSucceedEvent(result);
      return result;
    } catch (exception) {
      this.analytics.sendGetRECloudDbsFailedEvent(exception);
      throw exception;
    }
  }

  parseCloudAccountResponse(
    account: IRedisCloudAccount,
  ): GetCloudAccountShortInfoResponse {
    return {
      accountId: account.id,
      accountName: account.name,
      ownerName: get(account, ['key', 'owner', 'name']),
      ownerEmail: get(account, ['key', 'owner', 'email']),
    };
  }

  parseCloudSubscriptionsResponse(
    subscriptions: IRedisCloudSubscription[],
  ): GetRedisCloudSubscriptionResponse[] {
    const result: GetRedisCloudSubscriptionResponse[] = [];
    if (subscriptions?.length) {
      subscriptions.forEach((subscription: IRedisCloudSubscription): void => {
        result.push({
          id: subscription.id,
          name: subscription.name,
          numberOfDatabases: subscription.numberOfDatabases,
          status: subscription.status,
          provider: get(subscription, ['cloudDetails', 0, 'provider']),
          region: get(subscription, [
            'cloudDetails',
            0,
            'regions',
            0,
            'region',
          ]),
        });
      });
    }
    return result;
  }

  parseCloudDatabasesInSubscriptionResponse(
    response: IRedisCloudDatabasesResponse,
  ): RedisCloudDatabase[] {
    const subscription = response.subscription[0];
    const { subscriptionId, databases } = subscription;
    let result: RedisCloudDatabase[] = [];
    databases.forEach((database: IRedisCloudDatabase): void => {
      // We do not send the databases which have 'memcached' as their protocol.
      if (database.protocol === RedisCloudDatabaseProtocol.Redis) {
        result.push(this.parseCloudDatabaseResponse(database, subscriptionId));
      }
    });
    result = result.map((database) => ({
      ...database,
      options: {
        ...database.options,
        isReplicaSource: !!this.findReplicasForDatabase(
          databases,
          database.databaseId,
        ).length,
      },
    }));
    return result;
  }

  parseCloudDatabaseResponse(
    database: IRedisCloudDatabase,
    subscriptionId: number,
  ): RedisCloudDatabase {
    const {
      databaseId, name, publicEndpoint, status, security,
    } = database;
    return new RedisCloudDatabase({
      subscriptionId,
      databaseId,
      name,
      publicEndpoint,
      status,
      password: security?.password,
      sslClientAuthentication: security.sslClientAuthentication,
      modules: database.modules
        .map((module: IRedisCloudDatabaseModule) => convertRECloudModuleName(module.name)),
      options: {
        enabledDataPersistence:
          database.dataPersistence !== RedisPersistencePolicy.None,
        persistencePolicy: database.dataPersistence,
        enabledRedisFlash:
          database.memoryStorage === RedisCloudMemoryStorage.RamAndFlash,
        enabledReplication: database.replication,
        enabledBackup: !!database.periodicBackupPath,
        enabledClustering: database.clustering.numberOfShards > 1,
        isReplicaDestination: !!database.replicaOf,
      },
    });
  }

  getApiError(error: AxiosError, errorTitle: string): HttpException {
    const { response } = error;
    if (response) {
      if (response.status === 401 || response.status === 403) {
        this.logger.error(`${errorTitle}. ${error.message}`);
        return new ForbiddenException(ERROR_MESSAGES.REDIS_CLOUD_FORBIDDEN);
      }
      if (response.status === 500) {
        this.logger.error(`${errorTitle}. ${error.message}`);
        return new InternalServerErrorException(
          ERROR_MESSAGES.SERVER_NOT_AVAILABLE,
        );
      }
      if (response.data) {
        const { data } = response;
        this.logger.error(
          `${errorTitle} ${error.message}`,
          JSON.stringify(data),
        );
        return new InternalServerErrorException(data.description || data.error);
      }
    }
    this.logger.error(`${errorTitle}. ${error.message}`);
    return new InternalServerErrorException(ERROR_MESSAGES.SERVER_NOT_AVAILABLE);
  }

  private getAuthHeaders(apiKey: string, apiSecretKey: string) {
    return {
      'x-api-key': apiKey,
      'x-api-secret-key': apiSecretKey,
    };
  }

  private findReplicasForDatabase(
    databases: IRedisCloudDatabase[],
    sourceDatabaseId: number,
  ): IRedisCloudDatabase[] {
    const sourceDatabase: IRedisCloudDatabase = find(databases, {
      databaseId: sourceDatabaseId,
    });
    if (!sourceDatabase) {
      return [];
    }
    return databases.filter((replica: IRedisCloudDatabase): boolean => {
      const endpoints = get(replica, ['replicaOf', 'endpoints']);
      if (
        replica.databaseId === sourceDatabaseId
        || !endpoints
        || !endpoints.length
      ) {
        return false;
      }
      return endpoints.some((endpoint: string): boolean => (
        endpoint.includes(sourceDatabase.publicEndpoint)
          || endpoint.includes(sourceDatabase.privateEndpoint)
      ));
    });
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
            const database = await this.getDatabase({
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
                  status: ActionStatus.Fail,
                  message: exception.message,
                  error: exception?.getResponse(),
                  databaseDetails: database,
                };
              }
              const [host, port] = publicEndpoint.split(':');

              await this.databaseService.create({
                host,
                port: parseInt(port, 10),
                name,
                nameFromProvider: name,
                password,
                provider: HostingProvider.RE_CLOUD,
              });

              return {
                ...dto,
                status: ActionStatus.Success,
                message: 'Added',
                databaseDetails: database,
              };
            } catch (error) {
              return {
                ...dto,
                status: ActionStatus.Fail,
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
}
