import { Test, TestingModule } from '@nestjs/testing';
import axios, { AxiosError } from 'axios';
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  mockCloudAccountInfo, mockCloudApiAccount, mockCloudApiDatabase, mockCloudApiDatabases, mockCloudApiSubscription,
  mockCloudAuthDto, mockCloudAutodiscoveryAnalytics, mockCloudDatabase, mockCloudDatabaseFromList,
  mockCloudSubscription, mockDatabaseService, MockType,
} from 'src/__mocks__';
import { DatabaseService } from 'src/modules/database/database.service';
import { CloudAutodiscoveryService } from 'src/modules/cloud/autodiscovery/cloud-autodiscovery.service';
import { CloudAutodiscoveryAnalytics } from 'src/modules/cloud/autodiscovery/cloud-autodiscovery.analytics';

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

      expect(await service.getSubscriptions(mockCloudAuthDto)).toEqual([mockCloudSubscription]);
      expect(analytics.sendGetRECloudSubsSucceedEvent).toHaveBeenCalledWith([mockCloudSubscription]);
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

      expect(await service.getSubscriptionDatabase({
        ...mockCloudAuthDto,
        subscriptionId: mockCloudSubscription.id,
        databaseId: mockCloudDatabase.databaseId,
      })).toEqual(mockCloudDatabase);
    });
    it('the user could not be authenticated', async () => {
      mockedAxios.get.mockRejectedValue(mockApiUnauthenticatedResponse);

      await expect(
        service.getSubscriptionDatabase({
          ...mockCloudAuthDto,
          subscriptionId: mockCloudSubscription.id,
          databaseId: mockCloudDatabase.databaseId,
        }),
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
        service.getSubscriptionDatabase({
          ...mockCloudAuthDto,
          subscriptionId: mockCloudSubscription.id,
          databaseId: mockCloudDatabase.databaseId,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getSubscriptionDatabases', () => {
    it('successfully get Redis Enterprise Cloud databases', async () => {
      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: mockCloudApiDatabases,
      });

      expect(await service.getSubscriptionDatabases({
        ...mockCloudAuthDto,
        subscriptionId: mockCloudSubscription.id,
      })).toEqual([mockCloudDatabaseFromList]);
    });
    it('the user could not be authenticated', async () => {
      mockedAxios.get.mockRejectedValue(mockApiUnauthenticatedResponse);

      await expect(service.getSubscriptionDatabases({
        ...mockCloudAuthDto,
        subscriptionId: mockCloudSubscription.id,
      })).rejects.toThrow(ForbiddenException);
    });
    it('subscription not found', async () => {
      mockedAxios.get.mockRejectedValue({
        message: `Subscription ${mockCloudSubscription.id} not found`,
        response: {
          status: 404,
        },
      });

      await expect(service.getSubscriptionDatabases({
        ...mockCloudAuthDto,
        subscriptionId: mockCloudSubscription.id,
      })).rejects.toThrow(NotFoundException);
    });
  });

  describe('getDatabasesInMultipleSubscriptions', () => {
    beforeEach(() => {
      service.getSubscriptionDatabases = jest.fn().mockResolvedValue([]);
    });
    it('should call getDatabasesInSubscription', async () => {
      await service.getDatabases({
        ...mockCloudAuthDto,
        subscriptionIds: [86070, 86071],
      });

      expect(service.getSubscriptionDatabases).toHaveBeenCalledTimes(2);
    });
    it('should not call getDatabasesInSubscription for duplicated ids', async () => {
      await service.getDatabases({
        ...mockCloudAuthDto,
        subscriptionIds: [86070, 86070, 86071],
      });

      expect(service.getSubscriptionDatabases).toHaveBeenCalledTimes(2);
    });
    it('subscription not found', async () => {
      service.getSubscriptionDatabases = jest
        .fn()
        .mockRejectedValue(new NotFoundException());

      await expect(
        service.getDatabases({
          ...mockCloudAuthDto,
          subscriptionIds: [86070, 86071],
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
  });
});
