import { Test, TestingModule } from '@nestjs/testing';
import axios, { AxiosError } from 'axios';
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { mockAutodiscoveryAnalyticsService } from 'src/__mocks__';
import { IRedisCloudAccount } from 'src/modules/redis-enterprise/models/redis-cloud-account';
import {
  CloudAuthDto,
  GetCloudAccountShortInfoResponse,
  RedisCloudDatabase,
  GetRedisCloudSubscriptionResponse,
} from 'src/modules/redis-enterprise/dto/cloud.dto';
import {
  IRedisCloudSubscription,
  RedisCloudSubscriptionStatus,
} from 'src/modules/redis-enterprise/models/redis-cloud-subscriptions';
import {
  IRedisCloudDatabase,
  IRedisCloudDatabasesResponse,
  RedisCloudDatabaseProtocol,
} from 'src/modules/redis-enterprise/models/redis-cloud-database';
import { RedisEnterpriseDatabaseStatus } from 'src/modules/redis-enterprise/models/redis-enterprise-database';
import { RedisCloudBusinessService } from './redis-cloud-business.service';
import { AutodiscoveryAnalyticsService } from '../autodiscovery-analytics.service/autodiscovery-analytics.service';

const mockedAxios = axios as jest.Mocked<typeof axios>;
jest.mock('axios');
mockedAxios.create = jest.fn(() => mockedAxios);

const mockCloudAuthDto: CloudAuthDto = {
  apiKey: 'api_key',
  apiSecretKey: 'api_secret_key',
};
const mockRedisCloudAccount: IRedisCloudAccount = {
  id: 40131,
  name: 'Redis Labs',
  createdTimestamp: '2018-12-23T15:15:31Z',
  updatedTimestamp: '2020-06-03T13:16:59Z',
  key: {
    name: 'QA-HashedIn-Test-API-Key-2',
    accountId: 40131,
    accountName: 'Redis Labs',
    allowedSourceIps: ['0.0.0.0/0'],
    createdTimestamp: '2020-04-06T09:22:38Z',
    owner: {
      name: 'Cloud Account',
      email: 'cloud.account@redislabs.com',
    },
    httpSourceIp: '198.141.36.229',
  },
};

const mockRedisCloudSubscription: IRedisCloudSubscription = {
  id: 108353,
  name: 'external CA',
  status: RedisCloudSubscriptionStatus.Active,
  paymentMethodId: 8240,
  memoryStorage: 'ram',
  storageEncryption: false,
  numberOfDatabases: 7,
  subscriptionPricing: [
    {
      type: 'Shards',
      typeDetails: 'high-throughput',
      quantity: 2,
      quantityMeasurement: 'shards',
      pricePerUnit: 0.124,
      priceCurrency: 'USD',
      pricePeriod: 'hour',
    },
  ],
  cloudDetails: [
    {
      provider: 'AWS',
      cloudAccountId: 16424,
      totalSizeInGb: 0.0323,
      regions: [
        {
          region: 'us-east-1',
          networking: [
            {
              deploymentCIDR: '10.0.0.0/24',
              subnetId: 'subnet-0a2dd5829daf83024',
            },
          ],
          preferredAvailabilityZones: ['us-east-1a'],
          multipleAvailabilityZones: false,
        },
      ],
    },
  ],
};

const mockRedisCloudDatabase: IRedisCloudDatabase = {
  databaseId: 50859754,
  name: 'bdb',
  protocol: RedisCloudDatabaseProtocol.Redis,
  provider: 'GCP',
  region: 'us-central1',
  redisVersionCompliance: '5.0.5',
  status: RedisEnterpriseDatabaseStatus.Active,
  memoryLimitInGb: 1.0,
  memoryUsedInMb: 6.0,
  memoryStorage: 'ram',
  supportOSSClusterApi: false,
  dataPersistence: 'none',
  replication: true,
  dataEvictionPolicy: 'volatile-lru',
  throughputMeasurement: {
    by: 'operations-per-second',
    value: 25000,
  },
  activatedOn: '2019-12-31T09:38:41Z',
  lastModified: '2019-12-31T09:38:41Z',
  publicEndpoint:
    'redis-14621.c34097.us-central1-mz.gcp.qa-cloud.rlrcp.com:14621',
  privateEndpoint:
    'redis-14621.internal.c34097.us-central1-mz.gcp.qa-cloud.rlrcp.com:14621',
  replicaOf: {
    endpoints: [
      'redis-19669.c9244.us-central1-mz.gcp.cloud.rlrcp.com:19669',
      'redis-14074.c9243.us-central1-mz.gcp.cloud.rlrcp.com:14074',
    ],
  },
  clustering: {
    numberOfShards: 1,
    regexRules: [],
    hashingPolicy: 'standard',
  },
  security: {
    sslClientAuthentication: false,
    sourceIps: ['0.0.0.0/0'],
  },
  modules: [
    {
      id: 1,
      name: 'ReJSON',
      version: 'v10007',
    },
  ],
  alerts: [],
};

const mockUnauthenticatedErrorMessage = 'Request failed with status code 401';
const mockApiUnauthenticatedResponse = {
  message: mockUnauthenticatedErrorMessage,
  response: {
    status: 401,
  },
};

const mockParsedRedisCloudDatabase: RedisCloudDatabase = {
  subscriptionId: mockRedisCloudSubscription.id,
  databaseId: mockRedisCloudDatabase.databaseId,
  name: mockRedisCloudDatabase.name,
  publicEndpoint: mockRedisCloudDatabase.publicEndpoint,
  status: mockRedisCloudDatabase.status,
  sslClientAuthentication: false,
  password: undefined,
  modules: ['ReJSON'],
  options: {
    enabledBackup: false,
    enabledClustering: false,
    enabledDataPersistence: false,
    enabledRedisFlash: false,
    enabledReplication: true,
    isReplicaDestination: true,
    persistencePolicy: 'none',
  },
};

const mockRedisCloudDatabasesResponse: IRedisCloudDatabasesResponse = {
  accountId: 40131,
  subscription: [
    {
      subscriptionId: 86070,
      numberOfDatabases: 1,
      databases: [mockRedisCloudDatabase],
    },
  ],
};

describe('RedisCloudBusinessService', () => {
  let service: RedisCloudBusinessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisCloudBusinessService,
        {
          provide: AutodiscoveryAnalyticsService,
          useFactory: mockAutodiscoveryAnalyticsService,
        },
      ],
    }).compile();

    service = module.get<RedisCloudBusinessService>(RedisCloudBusinessService);
  });

  describe('getAccount', () => {
    let parseCloudAccountResponse: jest.SpyInstance<
    GetCloudAccountShortInfoResponse,
    [account: IRedisCloudAccount]
    >;
    beforeEach(() => {
      parseCloudAccountResponse = jest.spyOn(
        service,
        'parseCloudAccountResponse',
      );
    });

    it('successfully get Redis Enterprise Cloud account', async () => {
      const response = {
        status: 200,
        data: { account: mockRedisCloudAccount },
      };
      mockedAxios.get.mockResolvedValue(response);

      await expect(service.getAccount(mockCloudAuthDto)).resolves.not.toThrow();
      expect(mockedAxios.get).toHaveBeenCalled();
      expect(parseCloudAccountResponse).toHaveBeenCalledWith(
        mockRedisCloudAccount,
      );
    });
    it('Should throw Forbidden exception', async () => {
      mockedAxios.get.mockRejectedValue(mockApiUnauthenticatedResponse);

      await expect(service.getAccount(mockCloudAuthDto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getSubscriptions', () => {
    let parseCloudSubscriptionsResponse: jest.SpyInstance<
    GetRedisCloudSubscriptionResponse[],
    [subscriptions: IRedisCloudSubscription[]]
    >;
    beforeEach(() => {
      parseCloudSubscriptionsResponse = jest.spyOn(
        service,
        'parseCloudSubscriptionsResponse',
      );
    });

    it('successfully get Redis Enterprise Cloud subscriptions', async () => {
      const response = {
        status: 200,
        data: { subscriptions: [mockRedisCloudSubscription] },
      };
      mockedAxios.get.mockResolvedValue(response);

      await expect(
        service.getSubscriptions(mockCloudAuthDto),
      ).resolves.not.toThrow();
      expect(mockedAxios.get).toHaveBeenCalled();
      expect(parseCloudSubscriptionsResponse).toHaveBeenCalledWith([
        mockRedisCloudSubscription,
      ]);
    });
    it('should throw forbidden error when get subscriptions', async () => {
      mockedAxios.get.mockRejectedValue(mockApiUnauthenticatedResponse);

      await expect(service.getSubscriptions(mockCloudAuthDto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getDatabasesInSubscription', () => {
    let parseCloudDatabasesResponse: jest.SpyInstance<
    RedisCloudDatabase[],
    [response: IRedisCloudDatabasesResponse]
    >;
    beforeEach(() => {
      parseCloudDatabasesResponse = jest.spyOn(
        service,
        'parseCloudDatabasesInSubscriptionResponse',
      );
    });

    it('successfully get Redis Enterprise Cloud databases', async () => {
      const response = {
        status: 200,
        data: mockRedisCloudDatabasesResponse,
      };
      mockedAxios.get.mockResolvedValue(response);

      await expect(
        service.getDatabasesInSubscription({
          ...mockCloudAuthDto,
          subscriptionId: 86070,
        }),
      ).resolves.not.toThrow();
      expect(mockedAxios.get).toHaveBeenCalled();
      expect(parseCloudDatabasesResponse).toHaveBeenCalledWith(
        mockRedisCloudDatabasesResponse,
      );
    });
    it('the user could not be authenticated', async () => {
      mockedAxios.get.mockRejectedValue(mockApiUnauthenticatedResponse);

      await expect(
        service.getDatabasesInSubscription({
          ...mockCloudAuthDto,
          subscriptionId: 86070,
        }),
      ).rejects.toThrow(ForbiddenException);
    });
    it('subscription not found', async () => {
      const subscriptionId = mockRedisCloudSubscription.id;
      const apiResponse = {
        message: `Subscription ${subscriptionId} not found`,
        response: {
          status: 404,
        },
      };
      mockedAxios.get.mockRejectedValue(apiResponse);

      await expect(
        service.getDatabasesInSubscription({
          ...mockCloudAuthDto,
          subscriptionId,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getDatabasesInMultipleSubscriptions', () => {
    beforeEach(() => {
      service.getDatabasesInSubscription = jest.fn().mockResolvedValue([]);
    });
    it('should call getDatabasesInSubscription', async () => {
      await service.getDatabasesInMultipleSubscriptions({
        ...mockCloudAuthDto,
        subscriptionIds: [86070, 86071],
      });

      expect(service.getDatabasesInSubscription).toHaveBeenCalledTimes(2);
    });
    it('should not call getDatabasesInSubscription for duplicated ids', async () => {
      await service.getDatabasesInMultipleSubscriptions({
        ...mockCloudAuthDto,
        subscriptionIds: [86070, 86070, 86071],
      });

      expect(service.getDatabasesInSubscription).toHaveBeenCalledTimes(2);
    });
    it('subscription not found', async () => {
      service.getDatabasesInSubscription = jest
        .fn()
        .mockRejectedValue(new NotFoundException());

      await expect(
        service.getDatabasesInMultipleSubscriptions({
          ...mockCloudAuthDto,
          subscriptionIds: [86070, 86071],
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getDatabase', () => {
    let parseCloudDatabaseResponse: jest.SpyInstance<
    RedisCloudDatabase,
    [database: IRedisCloudDatabase, subscriptionId: number]
    >;
    const subscriptionId = mockRedisCloudSubscription.id;
    const databaseId = mockRedisCloudSubscription.id;
    beforeEach(() => {
      parseCloudDatabaseResponse = jest.spyOn(
        service,
        'parseCloudDatabaseResponse',
      );
    });

    it('successfully get database from Redis Cloud subscriptions', async () => {
      const response = {
        status: 200,
        data: mockRedisCloudDatabase,
      };
      mockedAxios.get.mockResolvedValue(response);

      await expect(
        service.getDatabase({
          ...mockCloudAuthDto,
          subscriptionId,
          databaseId,
        }),
      ).resolves.not.toThrow();
      expect(mockedAxios.get).toHaveBeenCalled();
      expect(parseCloudDatabaseResponse).toHaveBeenCalledWith(
        mockRedisCloudDatabase,
        subscriptionId,
      );
    });
    it('the user could not be authenticated', async () => {
      mockedAxios.get.mockRejectedValue(mockApiUnauthenticatedResponse);

      await expect(
        service.getDatabase({
          ...mockCloudAuthDto,
          subscriptionId,
          databaseId,
        }),
      ).rejects.toThrow(ForbiddenException);
    });
    it('database not found', async () => {
      const apiResponse = {
        message: `Subscription ${subscriptionId} database ${databaseId} not found`,
        response: {
          status: 404,
        },
      };
      mockedAxios.get.mockRejectedValue(apiResponse);

      await expect(
        service.getDatabase({
          ...mockCloudAuthDto,
          subscriptionId,
          databaseId,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('parseCloudDatabaseResponse', () => {
    const subscriptionId = mockRedisCloudSubscription.id;
    it('should return correct value', () => {
      const result = service.parseCloudDatabaseResponse(
        mockRedisCloudDatabase,
        subscriptionId,
      );

      expect(result).toEqual(mockParsedRedisCloudDatabase);
    });
  });

  describe('_getApiError', () => {
    const title = 'Failed to get databases in RE cloud subscription';
    const mockError: AxiosError<any> = {
      name: '',
      message: mockUnauthenticatedErrorMessage,
      isAxiosError: true,
      config: null,
      response: {
        statusText: mockUnauthenticatedErrorMessage,
        data: null,
        headers: [],
        config: null,
        status: 401,
      },
      toJSON: () => null,
    };
    it('should throw ForbiddenException', async () => {
      const result = service.getApiError(mockError, title);

      expect(result).toBeInstanceOf(ForbiddenException);
    });
    it('should throw InternalServerErrorException from response', async () => {
      const errorMessage = 'Request failed with status code 500';
      const error = {
        ...mockError,
        message: errorMessage,
        response: {
          ...mockError.response,
          status: 500,
          statusText: errorMessage,
        },
      };
      const result = service.getApiError(error, title);

      expect(result).toBeInstanceOf(InternalServerErrorException);
    });
    it('should throw InternalServerErrorException', async () => {
      const error = {
        ...mockError,
        message: 'Request failed with status code 500',
        response: undefined,
      };
      const result = service.getApiError(error, title);

      expect(result).toBeInstanceOf(InternalServerErrorException);
    });
  });
});
