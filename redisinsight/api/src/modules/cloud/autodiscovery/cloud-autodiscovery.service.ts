import {
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException, ServiceUnavailableException,
} from '@nestjs/common';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { uniq } from 'lodash';
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
} from 'src/modules/cloud/autodiscovery/models';
import { DatabaseService } from 'src/modules/database/database.service';
import { HostingProvider } from 'src/modules/database/entities/database.entity';
import { ActionStatus } from 'src/common/models';
import {
  parseCloudAccountResponse,
  parseCloudDatabaseResponse,
  parseCloudSubscriptionsResponse,
  parseCloudDatabasesInSubscriptionResponse,
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
   * Generates auth headers to attach to the request
   * @param apiKey
   * @param apiSecretKey
   * @private
   */
  static getAuthHeaders(apiKey: string, apiSecretKey: string) {
    return {
      'x-api-key': apiKey,
      'x-api-secret-key': apiSecretKey,
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
   * @param dto
   */
  async getAccount(dto: CloudAuthDto): Promise<CloudAccountInfo> {
    this.logger.log('Getting cloud account.');
    const { apiKey, apiSecretKey } = dto;
    try {
      const {
        data: { account },
      }: AxiosResponse = await this.api.get(`${this.config.url}/`, {
        headers: CloudAutodiscoveryService.getAuthHeaders(apiKey, apiSecretKey),
      });

      this.logger.log('Succeed to get RE cloud account.');

      return parseCloudAccountResponse(account);
    } catch (error) {
      throw this.getApiError(error, 'Failed to get RE cloud account');
    }
  }

  /**
   * Get list of account subscriptions
   * @param dto
   */
  async getSubscriptions(dto: CloudAuthDto): Promise<CloudSubscription[]> {
    this.logger.log('Getting RE cloud subscriptions.');
    const { apiKey, apiSecretKey } = dto;
    try {
      const {
        data: { subscriptions },
      }: AxiosResponse = await this.api.get(
        `${this.config.url}/subscriptions`,
        {
          headers: CloudAutodiscoveryService.getAuthHeaders(apiKey, apiSecretKey),
        },
      );
      this.logger.log('Succeed to get RE cloud subscriptions.');
      const result = parseCloudSubscriptionsResponse(subscriptions);
      this.analytics.sendGetRECloudSubsSucceedEvent(result);
      return result;
    } catch (error) {
      const exception = this.getApiError(error, 'Failed to get RE cloud subscriptions');
      this.analytics.sendGetRECloudSubsFailedEvent(exception);
      throw exception;
    }
  }

  /**
   * Get single database details
   * @param dto
   */
  async getSubscriptionDatabase(dto: GetCloudSubscriptionDatabaseDto): Promise<CloudDatabase> {
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
          headers: CloudAutodiscoveryService.getAuthHeaders(apiKey, apiSecretKey),
        },
      );
      this.logger.log('Succeed to get databases in RE cloud subscription.');
      return parseCloudDatabaseResponse(data, subscriptionId);
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
   * @param dto
   */
  async getSubscriptionDatabases(dto: GetCloudSubscriptionDatabasesDto): Promise<CloudDatabase[]> {
    const { apiKey, apiSecretKey, subscriptionId } = dto;
    this.logger.log(
      `Getting databases in RE cloud subscription. subscription id: ${subscriptionId}`,
    );
    try {
      const { data }: AxiosResponse = await this.api.get(
        `${this.config.url}/subscriptions/${subscriptionId}/databases`,
        {
          headers: CloudAutodiscoveryService.getAuthHeaders(apiKey, apiSecretKey),
        },
      );
      this.logger.log('Succeed to get databases in RE cloud subscription.');
      return parseCloudDatabasesInSubscriptionResponse(data);
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
   * @param dto
   */
  async getDatabases(dto: GetCloudDatabasesDto): Promise<CloudDatabase[]> {
    const { apiKey, apiSecretKey } = dto;
    const subscriptionIds = uniq(dto.subscriptionIds);
    this.logger.log('Getting databases in RE cloud subscriptions.');
    let result = [];
    try {
      await Promise.all(
        subscriptionIds.map(async (subscriptionId: number) => {
          const databases = await this.getSubscriptionDatabases({
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

  async addRedisCloudDatabases(
    auth: CloudAuthDto,
    addDatabasesDto: AddCloudDatabaseDto[],
  ): Promise<AddCloudDatabaseResponse[]> {
    this.logger.log('Adding Redis Cloud databases.');
    let result: AddCloudDatabaseResponse[];
    try {
      result = await Promise.all(
        addDatabasesDto.map(
          async (
            dto: AddCloudDatabaseResponse,
          ): Promise<AddCloudDatabaseResponse> => {
            const database = await this.getSubscriptionDatabase({
              ...auth,
              ...dto,
            });
            try {
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
