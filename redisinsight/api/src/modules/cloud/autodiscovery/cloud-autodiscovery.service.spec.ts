import { Test, TestingModule } from '@nestjs/testing';
import axios, { AxiosError } from 'axios';
import { ForbiddenException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import {
  mockAddCloudDatabaseDto,
  mockAddCloudDatabaseDtoFixed,
  mockAddCloudDatabaseResponse,
  mockAddCloudDatabaseResponseFixed,
  mockCloudAccountInfo,
  mockCloudApiAccount,
  mockCloudApiDatabase, mockCloudApiDatabaseFixed,
  mockCloudApiSubscription,
  mockCloudApiSubscriptionDatabases,
  mockCloudApiSubscriptionDatabasesFixed,
  mockCloudAuthDto,
  mockCloudAutodiscoveryAnalytics,
  mockCloudDatabase,
  mockCloudDatabaseFixed,
  mockCloudDatabaseFromList, mockCloudDatabaseFromListFixed,
  mockCloudSubscription,
  mockDatabaseService,
  mockGetCloudSubscriptionDatabaseDto,
  mockGetCloudSubscriptionDatabaseDtoFixed,
  mockGetCloudSubscriptionDatabasesDto, mockGetCloudSubscriptionDatabasesDtoFixed,
  MockType,
} from 'src/__mocks__';
import { DatabaseService } from 'src/modules/database/database.service';
import { CloudAutodiscoveryService } from 'src/modules/cloud/autodiscovery/cloud-autodiscovery.service';
import { CloudAutodiscoveryAnalytics } from 'src/modules/cloud/autodiscovery/cloud-autodiscovery.analytics';
import { CloudDatabaseStatus, CloudSubscriptionType } from 'src/modules/cloud/autodiscovery/models';
import { ActionStatus } from 'src/common/models';

const mockedAxios = axios as jest.Mocked<typeof axios>;
jest.mock('axios');
mockedAxios.create = jest.fn(() => mockedAxios);

const mockUnauthenticatedErrorMessage = 'Request failed with status code 401';
const mockApiUnauthenticatedResponse = {
  message: mockUnauthenticatedErrorMessage,
  response: {
    status: 401,
  },
};

describe('CloudAutodiscoveryService', () => {
  let service: CloudAutodiscoveryService;
  let analytics: MockType<CloudAutodiscoveryAnalytics>;
  let databaseService: MockType<DatabaseService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudAutodiscoveryService,
        {
          provide: DatabaseService,
          useFactory: mockDatabaseService,
        },
        {
          provide: CloudAutodiscoveryAnalytics,
          useFactory: mockCloudAutodiscoveryAnalytics,
        },
      ],
    }).compile();

    service = module.get(CloudAutodiscoveryService);
    analytics = module.get(CloudAutodiscoveryAnalytics);
    databaseService = module.get(DatabaseService);
  });

  describe('getAccount', () => {
    it('successfully get Redis Enterprise Cloud account', async () => {
      const response = {
        status: 200,
        data: { account: mockCloudApiAccount },
      };
      mockedAxios.get.mockResolvedValue(response);

      expect(await service.getAccount(mockCloudAuthDto)).toEqual(mockCloudAccountInfo);
    });
    it('Should throw Forbidden exception', async () => {
      mockedAxios.get.mockRejectedValue(mockApiUnauthenticatedResponse);

      await expect(service.getAccount(mockCloudAuthDto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getSubscriptions', () => {
    it('successfully get Redis Enterprise Cloud subscriptions', async () => {
      const response = {
        status: 200,
        data: { subscriptions: [mockCloudApiSubscription] },
      };
      mockedAxios.get.mockResolvedValue(response);

      expect(await service.getSubscriptions(mockCloudAuthDto)).toEqual([{
        ...mockCloudSubscription,
        type: CloudSubscriptionType.Fixed,
      }, {
        ...mockCloudSubscription,
        type: CloudSubscriptionType.Flexible,
      }]);
      expect(analytics.sendGetRECloudSubsSucceedEvent)
        .toHaveBeenCalledWith([{
          ...mockCloudSubscription,
          type: CloudSubscriptionType.Fixed,
        }]);
      expect(analytics.sendGetRECloudSubsSucceedEvent)
        .toHaveBeenCalledWith([{
          ...mockCloudSubscription,
          type: CloudSubscriptionType.Flexible,
        }]);
    });
    it('should throw forbidden error when get subscriptions', async () => {
      mockedAxios.get.mockRejectedValue(mockApiUnauthenticatedResponse);

      await expect(service.getSubscriptions(mockCloudAuthDto)).rejects.toThrow(
        ForbiddenException,
      );

      expect(analytics.sendGetRECloudSubsFailedEvent)
        .toHaveBeenCalledWith(service['getApiError'](
          mockApiUnauthenticatedResponse as AxiosError,
          'Failed to get RE cloud subscriptions',
        ));
    });
  });

  describe('getSubscriptionDatabase', () => {
    it('successfully get database from Redis Cloud subscriptions', async () => {
      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: mockCloudApiDatabase,
      });

      expect(await service.getSubscriptionDatabase(
        mockCloudAuthDto,
        mockGetCloudSubscriptionDatabaseDto,
      )).toEqual(mockCloudDatabase);
    });
    it('successfully get fixed database from Redis Cloud subscriptions', async () => {
      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: mockCloudApiDatabaseFixed,
      });

      expect(await service.getSubscriptionDatabase(
        mockCloudAuthDto,
        mockGetCloudSubscriptionDatabaseDtoFixed,
      )).toEqual(mockCloudDatabaseFixed);
    });
    it('the user could not be authenticated', async () => {
      mockedAxios.get.mockRejectedValue(mockApiUnauthenticatedResponse);

      await expect(
        service.getSubscriptionDatabase(mockCloudAuthDto, mockGetCloudSubscriptionDatabaseDto),
      ).rejects.toThrow(ForbiddenException);
    });
    it('database not found', async () => {
      const apiResponse = {
        message: `Subscription ${mockCloudSubscription.id} database ${mockCloudDatabase.databaseId} not found`,
        response: {
          status: 404,
        },
      };
      mockedAxios.get.mockRejectedValue(apiResponse);

      await expect(
        service.getSubscriptionDatabase(mockCloudAuthDto, mockGetCloudSubscriptionDatabaseDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getSubscriptionDatabases', () => {
    it('successfully get cloud databases', async () => {
      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: mockCloudApiSubscriptionDatabases,
      });

      expect(await service.getSubscriptionDatabases(mockCloudAuthDto, mockGetCloudSubscriptionDatabasesDto))
        .toEqual([mockCloudDatabaseFromList]);
    });
    it('successfully get cloud fixed databases', async () => {
      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: mockCloudApiSubscriptionDatabasesFixed,
      });

      expect(await service.getSubscriptionDatabases(mockCloudAuthDto, mockGetCloudSubscriptionDatabasesDtoFixed))
        .toEqual([mockCloudDatabaseFromListFixed]);
    });
    it('the user could not be authenticated', async () => {
      mockedAxios.get.mockRejectedValue(mockApiUnauthenticatedResponse);

      await expect(service.getSubscriptionDatabases(mockCloudAuthDto, mockGetCloudSubscriptionDatabasesDto))
        .rejects.toThrow(ForbiddenException);
    });
    it('subscription not found', async () => {
      mockedAxios.get.mockRejectedValue({
        message: `Subscription ${mockCloudSubscription.id} not found`,
        response: {
          status: 404,
        },
      });

      await expect(service.getSubscriptionDatabases(mockCloudAuthDto, mockGetCloudSubscriptionDatabasesDto))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('getDatabases', () => {
    beforeEach(() => {
      service.getSubscriptionDatabases = jest.fn().mockResolvedValue([]);
    });
    it('should call getSubscriptionDatabases 2 times', async () => {
      await service.getDatabases(mockCloudAuthDto, {
        subscriptions: [
          { subscriptionId: 86070, subscriptionType: CloudSubscriptionType.Flexible },
          { subscriptionId: 86071, subscriptionType: CloudSubscriptionType.Flexible },
        ],
      });

      expect(service.getSubscriptionDatabases).toHaveBeenCalledTimes(2);
    });
    it('should call getSubscriptionDatabases 2 times (different types)', async () => {
      await service.getDatabases(mockCloudAuthDto, {
        subscriptions: [
          { subscriptionId: 86070, subscriptionType: CloudSubscriptionType.Flexible },
          { subscriptionId: 86071, subscriptionType: CloudSubscriptionType.Fixed },
        ],
      });

      expect(service.getSubscriptionDatabases).toHaveBeenCalledTimes(2);
    });
    it('should call getSubscriptionDatabases 2 times (same id but different types)', async () => {
      await service.getDatabases(mockCloudAuthDto, {
        subscriptions: [
          { subscriptionId: 86070, subscriptionType: CloudSubscriptionType.Flexible },
          { subscriptionId: 86070, subscriptionType: CloudSubscriptionType.Fixed },
        ],
      });

      expect(service.getSubscriptionDatabases).toHaveBeenCalledTimes(2);
    });
    it('should call getSubscriptionDatabases 2 times (uniq by id and type)', async () => {
      await service.getDatabases(mockCloudAuthDto, {
        subscriptions: [
          { subscriptionId: 86070, subscriptionType: CloudSubscriptionType.Flexible },
          { subscriptionId: 86071, subscriptionType: CloudSubscriptionType.Fixed },
          { subscriptionId: 86071, subscriptionType: CloudSubscriptionType.Fixed },
        ],
      });

      expect(service.getSubscriptionDatabases).toHaveBeenCalledTimes(2);
    });
    it('subscription not found', async () => {
      service.getSubscriptionDatabases = jest
        .fn()
        .mockRejectedValue(new NotFoundException());

      await expect(
        service.getDatabases(mockCloudAuthDto, {
          subscriptions: [
            { subscriptionId: 86070, subscriptionType: CloudSubscriptionType.Flexible },
            { subscriptionId: 86071, subscriptionType: CloudSubscriptionType.Fixed },
          ],
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getApiError', () => {
    const title = 'Failed to get databases in RE cloud subscription';
    const mockError: AxiosError<any> = {
      name: '',
      message: mockUnauthenticatedErrorMessage,
      isAxiosError: true,
      config: null,
      response: {
        statusText: mockUnauthenticatedErrorMessage,
        data: null,
        headers: {},
        config: null,
        status: 401,
      },
      toJSON: () => null,
    };
    it('should throw ForbiddenException', async () => {
      const result = service['getApiError'](mockError, title);

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
      const result = service['getApiError'](error, title);

      expect(result).toBeInstanceOf(InternalServerErrorException);
    });
    it('should throw InternalServerErrorException', async () => {
      const error = {
        ...mockError,
        message: 'Request failed with status code 500',
        response: undefined,
      };
      const result = service['getApiError'](error, title);

      expect(result).toBeInstanceOf(InternalServerErrorException);
    });
    it('should throw InternalServerErrorException with error from data', async () => {
      const error = {
        ...mockError,
        message: 'Request failed with status code 500',
        response: {
          data: {
            error: 'Service Unavailable',
          },
        },
      };
      const result = service['getApiError'](error as AxiosError, title);

      expect(result).toBeInstanceOf(InternalServerErrorException);
    });
  });

  describe('addRedisCloudDatabases', () => {
    let spy;

    beforeEach(() => {
      spy = jest.spyOn(service, 'getSubscriptionDatabase');
    });

    it('should successfully add 1 fixed and 1 flexible databases', async () => {
      spy.mockResolvedValueOnce(mockCloudDatabase);
      spy.mockResolvedValueOnce(mockCloudDatabaseFixed);

      const result = await service.addRedisCloudDatabases(mockCloudAuthDto, [
        mockAddCloudDatabaseDto,
        mockAddCloudDatabaseDtoFixed,
      ]);

      expect(result).toEqual([
        mockAddCloudDatabaseResponse,
        mockAddCloudDatabaseResponseFixed,
      ]);
    });

    it('should successfully add 1 fixed database and report 1 error without database details (404)', async () => {
      spy.mockRejectedValueOnce(new NotFoundException());
      spy.mockResolvedValueOnce(mockCloudDatabaseFixed);

      const result = await service.addRedisCloudDatabases(mockCloudAuthDto, [
        mockAddCloudDatabaseDto,
        mockAddCloudDatabaseDtoFixed,
      ]);

      expect(result).toEqual([
        {
          ...mockAddCloudDatabaseResponse,
          error: {
            message: 'Not Found',
            statusCode: 404,
          },
          message: 'Not Found',
          status: 'fail',
          databaseDetails: undefined, // no database details when database wasn't fetched from cloud
        },
        mockAddCloudDatabaseResponseFixed,
      ]);
    });

    it('should successfully add 1 fixed database and report 1 error with database details', async () => {
      spy.mockResolvedValueOnce(mockCloudDatabase);
      spy.mockResolvedValueOnce(mockCloudDatabaseFixed);
      databaseService.create.mockRejectedValueOnce(new Error('Connectivity issue'));

      const result = await service.addRedisCloudDatabases(mockCloudAuthDto, [
        mockAddCloudDatabaseDto,
        mockAddCloudDatabaseDtoFixed,
      ]);

      expect(result).toEqual([
        {
          ...mockAddCloudDatabaseResponse,
          message: 'Connectivity issue',
          status: ActionStatus.Fail,
        },
        mockAddCloudDatabaseResponseFixed,
      ]);
    });

    it('should successfully add 1 fixed database and report 1 error if db is not actives', async () => {
      spy.mockResolvedValueOnce({
        ...mockCloudDatabase,
        status: CloudDatabaseStatus.Pending,
      });
      spy.mockResolvedValueOnce(mockCloudDatabaseFixed);

      const result = await service.addRedisCloudDatabases(mockCloudAuthDto, [
        mockAddCloudDatabaseDto,
        mockAddCloudDatabaseDtoFixed,
      ]);

      expect(result).toEqual([
        {
          ...mockAddCloudDatabaseResponse,
          error: {
            error: 'Service Unavailable',
            message: 'The base is inactive.',
            statusCode: 503,
          },
          message: 'The base is inactive.',
          status: ActionStatus.Fail,
          databaseDetails: {
            ...mockAddCloudDatabaseResponse.databaseDetails,
            status: CloudDatabaseStatus.Pending,
          },
        },
        mockAddCloudDatabaseResponseFixed,
      ]);
    });
  });
});
