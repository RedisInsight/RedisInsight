import {
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { uniqBy } from 'lodash';
import config from 'src/utils/config';
import ERROR_MESSAGES from 'src/constants/error-messages';
import {
  AddCloudDatabaseDto,
  AddCloudDatabaseResponse,
  CloudAuthDto,
  GetCloudDatabasesDto,
  GetCloudSubscriptionDatabaseDto,
  GetCloudSubscriptionDatabasesDto,
} from 'src/modules/cloud/autodiscovery/dto';
import {
  CloudAccountInfo,
  CloudDatabase,
  CloudDatabaseStatus,
  CloudSubscription,
  CloudSubscriptionType,
} from 'src/modules/cloud/autodiscovery/models';
import { DatabaseService } from 'src/modules/database/database.service';
import { HostingProvider } from 'src/modules/database/entities/database.entity';
import { ActionStatus } from 'src/common/models';
import {
  parseCloudAccountResponse,
  parseCloudDatabaseResponse,
  parseCloudDatabasesInSubscriptionResponse,
  parseCloudSubscriptionsResponse,
} from 'src/modules/cloud/autodiscovery/utils/redis-cloud-converter';
import { CloudAutodiscoveryAnalytics } from 'src/modules/cloud/autodiscovery/cloud-autodiscovery.analytics';

@Injectable()
export class CloudAutodiscoveryService {
  private logger = new Logger('CloudAutodiscoveryService');

  private config = config.get('redis_cloud');

  private api = axios.create();

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly analytics: CloudAutodiscoveryAnalytics,
  ) {}

  /**
   * Get api base for fixed subscriptions
   * @param type
   * @private
   */
  getApiBase(type?: CloudSubscriptionType): string {
    return `${this.config.url}${type === CloudSubscriptionType.Fixed ? '/fixed' : ''}`;
  }

  /**
   * Generates auth headers to attach to the request
   * @param apiKey
   * @param apiSecret
   * @private
   */
  static getAuthHeaders({ apiKey, apiSecret }: CloudAuthDto) {
    return {
      'x-api-key': apiKey,
      'x-api-secret-key': apiSecret,
    };
  }

  /**
   * Generates proper error based on api response
   * @param error
   * @param errorTitle
   * @private
   */
  private getApiError(error: AxiosError, errorTitle: string): HttpException {
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

  /**
   * Get cloud account short info
   * @param authDto
   */
  async getAccount(authDto: CloudAuthDto): Promise<CloudAccountInfo> {
    this.logger.log('Getting cloud account.');
    try {
      const {
        data: { account },
      }: AxiosResponse = await this.api.get(`${this.config.url}/`, {
        headers: CloudAutodiscoveryService.getAuthHeaders(authDto),
      });

      this.logger.log('Succeed to get RE cloud account.');

      return parseCloudAccountResponse(account);
    } catch (error) {
      throw this.getApiError(error, 'Failed to get RE cloud account');
    }
  }

  /**
   * Get list of account subscriptions
   * @param authDto
   * @param type
   */
  async getSubscriptionsByType(authDto: CloudAuthDto, type: CloudSubscriptionType): Promise<CloudSubscription[]> {
    this.logger.log(`Getting cloud ${type} subscriptions.`);
    try {
      const {
        data: { subscriptions },
      }: AxiosResponse = await this.api.get(
        `${this.getApiBase(type)}/subscriptions`,
        {
          headers: CloudAutodiscoveryService.getAuthHeaders(authDto),
        },
      );
      this.logger.log('Succeed to get cloud flexible subscriptions.');
      const result = parseCloudSubscriptionsResponse(subscriptions, type);
      this.analytics.sendGetRECloudSubsSucceedEvent(result, type);
      return result;
    } catch (error) {
      const exception = this.getApiError(error, 'Failed to get cloud flexible subscriptions');
      this.analytics.sendGetRECloudSubsFailedEvent(exception, type);
      throw exception;
    }
  }

  async getSubscriptions(authDto: CloudAuthDto): Promise<CloudSubscription[]> {
    return [].concat(...await Promise.all([
      this.getSubscriptionsByType(authDto, CloudSubscriptionType.Fixed),
      this.getSubscriptionsByType(authDto, CloudSubscriptionType.Flexible),
    ]));
  }

  /**
   * Get single database details
   * @param authDto
   * @param dto
   */
  async getSubscriptionDatabase(
    authDto: CloudAuthDto,
    dto: GetCloudSubscriptionDatabaseDto,
  ): Promise<CloudDatabase> {
    const { subscriptionId, databaseId, subscriptionType } = dto;
    this.logger.log(
      `Getting database in RE cloud subscription. subscription id: ${subscriptionId}, database id: ${databaseId}`,
    );
    try {
      const { data }: AxiosResponse = await this.api.get(
        `${this.getApiBase(dto.subscriptionType)}/subscriptions/${subscriptionId}/databases/${databaseId}`,
        {
          headers: CloudAutodiscoveryService.getAuthHeaders(authDto),
        },
      );
      this.logger.log('Succeed to get databases in RE cloud subscription.');
      return parseCloudDatabaseResponse(data, subscriptionId, subscriptionType);
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

  /**
   * Get list of databases for subscription
   * @param authDto
   * @param dto
   */
  async getSubscriptionDatabases(
    authDto: CloudAuthDto,
    dto: GetCloudSubscriptionDatabasesDto,
  ): Promise<CloudDatabase[]> {
    const { subscriptionId, subscriptionType } = dto;
    this.logger.log(
      `Getting databases in RE cloud subscription. subscription id: ${subscriptionId}`,
    );
    try {
      const { data }: AxiosResponse = await this.api.get(
        `${this.getApiBase(subscriptionType)}/subscriptions/${subscriptionId}/databases`,
        {
          headers: CloudAutodiscoveryService.getAuthHeaders(authDto),
        },
      );
      this.logger.log('Succeed to get databases in RE cloud subscription.');
      return parseCloudDatabasesInSubscriptionResponse(data, subscriptionType);
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

  /**
   * Get get all databases from specified multiple subscriptions
   * @param authDto
   * @param dto
   */
  async getDatabases(
    authDto: CloudAuthDto,
    dto: GetCloudDatabasesDto,
  ): Promise<CloudDatabase[]> {
    const subscriptions = uniqBy(
      dto.subscriptions,
      ({ subscriptionId, subscriptionType }) => [subscriptionId, subscriptionType].join(),
    );

    this.logger.log('Getting databases in RE cloud subscriptions.');
    let result = [];
    try {
      await Promise.all(
        subscriptions.map(async (subscription) => {
          const databases = await this.getSubscriptionDatabases(authDto, subscription);
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

  async addRedisCloudDatabases(
    authDto: CloudAuthDto,
    addDatabasesDto: AddCloudDatabaseDto[],
  ): Promise<AddCloudDatabaseResponse[]> {
    this.logger.log('Adding Redis Cloud databases.');

    return Promise.all(
      addDatabasesDto.map(
        async (
          dto: AddCloudDatabaseDto,
        ): Promise<AddCloudDatabaseResponse> => {
          let database;
          try {
            database = await this.getSubscriptionDatabase(authDto, dto);

            const {
              publicEndpoint, name, password, status,
            } = database;
            if (status !== CloudDatabaseStatus.Active) {
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
              cloudDetails: database?.cloudDetails,
              timeout: this.config.cloudDatabaseConnectionTimeout,
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
  }
}
