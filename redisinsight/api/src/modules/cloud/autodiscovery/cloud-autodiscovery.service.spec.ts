import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import {
  mockCloudAccountInfo,
  mockCloudAutodiscoveryAnalytics,
  mockCloudCapiAccount,
  mockCloudCapiAuthDto,
  mockCloudCapiDatabase,
  mockCloudCapiDatabaseFixed,
  mockCloudCapiSubscription,
  mockCloudDatabase,
  mockCloudDatabaseFixed,
  mockCloudDatabaseFromList,
  mockCloudDatabaseFromListFixed,
  mockCloudSubscription,
  mockCloudSubscriptionFixed, mockCloudUserCapiService,
  mockDatabaseService,
  mockGetCloudSubscriptionDatabaseDto,
  mockGetCloudSubscriptionDatabaseDtoFixed,
  mockGetCloudSubscriptionDatabasesDto,
  mockGetCloudSubscriptionDatabasesDtoFixed,
  mockImportCloudDatabaseDto, mockImportCloudDatabaseDtoFixed,
  mockImportCloudDatabaseResponse,
  mockImportCloudDatabaseResponseFixed,
  MockType
} from 'src/__mocks__';
import { DatabaseService } from 'src/modules/database/database.service';
import { CloudAutodiscoveryService } from 'src/modules/cloud/autodiscovery/cloud-autodiscovery.service';
import { CloudAutodiscoveryAnalytics } from 'src/modules/cloud/autodiscovery/cloud-autodiscovery.analytics';
import { ActionStatus } from 'src/common/models';
import { CloudSubscriptionType } from 'src/modules/cloud/subscription/models';
import { CloudAutodiscoveryAuthType } from 'src/modules/cloud/autodiscovery/models';
import { CloudDatabase, CloudDatabaseStatus } from 'src/modules/cloud/database/models';
import { CloudApiUnauthorizedException } from 'src/modules/cloud/common/exceptions';
import { CloudUserCapiService } from 'src/modules/cloud/user/cloud-user.capi.service';
import { CloudSubscriptionCapiService } from 'src/modules/cloud/subscription/cloud-subscription.capi.service';
import { CloudDatabaseCapiService } from 'src/modules/cloud/database/cloud-database.capi.service';

describe('CloudAutodiscoveryService', () => {
  let service: CloudAutodiscoveryService;
  let cloudUserCapiService: MockType<CloudUserCapiService>;
  let cloudSubscriptionCapiService: MockType<CloudSubscriptionCapiService>;
  let cloudDatabaseCapiService: MockType<CloudDatabaseCapiService>;
  let analytics: MockType<CloudAutodiscoveryAnalytics>;
  let databaseService: MockType<DatabaseService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudAutodiscoveryService,
        {
          provide: DatabaseService,
          useFactory: mockCloudUserCapiService,
        },
        {
          provide: CloudUserCapiService,
          useFactory: mockCloudUserCapiService,
        },
        {
          provide: CloudSubscriptionCapiService,
          useFactory: jest.fn(),
        },
        {
          provide: CloudDatabaseCapiService,
          useFactory: jest.fn(),
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
    cloudUserCapiService = module.get(CloudUserCapiService);
  });

  describe('getAccount', () => {
    it('successfully get cloud account info', async () => {
      expect(await service.getAccount(mockCloudCapiAuthDto)).toEqual(mockCloudAccountInfo);
    });
    it('should throw CloudApiUnauthorizedException exception', async () => {
      cloudUserCapiService.getCurrentAccount.mockRejectedValueOnce(new CloudApiUnauthorizedException());
      await expect(service.getAccount(mockCloudCapiAuthDto)).rejects.toThrow(
        CloudApiUnauthorizedException,
      );
    });
  });
  //
  // describe('discoverSubscriptions', () => {
  //   it('successfully discover fixed and flexible cloud subscriptions', async () => {
  //     const response = {
  //       status: 200,
  //       data: { subscriptions: [mockCloudCapiSubscription] },
  //     };
  //     mockedAxios.get.mockResolvedValue(response);
  //
  //     expect(await service.discoverSubscriptions(
  //       mockCloudCapiAuthDto,
  //       CloudAutodiscoveryAuthType.Credentials,
  //     )).toEqual([{
  //       ...mockCloudSubscriptionFixed,
  //       type: CloudSubscriptionType.Fixed,
  //     }, {
  //       ...mockCloudSubscription,
  //       type: CloudSubscriptionType.Flexible,
  //     }]);
  //     expect(analytics.sendGetRECloudSubsSucceedEvent)
  //       .toHaveBeenCalledWith([{
  //         ...mockCloudSubscriptionFixed,
  //       }], CloudSubscriptionType.Fixed);
  //     expect(analytics.sendGetRECloudSubsSucceedEvent)
  //       .toHaveBeenCalledWith([{
  //         ...mockCloudSubscription,
  //       }], CloudSubscriptionType.Flexible);
  //   });
  //   it('should throw forbidden error when get subscriptions', async () => {
  //     mockedAxios.get.mockRejectedValue(mockApiUnauthenticatedResponse);
  //
  //     await expect(service.discoverSubscriptions(
  //       mockCloudCapiAuthDto,
  //       CloudAutodiscoveryAuthType.Credentials,
  //     )).rejects.toThrow(
  //       ForbiddenException,
  //     );
  //
  //     expect(analytics.sendGetRECloudSubsFailedEvent)
  //       .toHaveBeenCalledWith(service['getApiError'](
  //         mockApiUnauthenticatedResponse as AxiosError,
  //         'Failed to get RE cloud subscriptions',
  //       ), CloudSubscriptionType.Flexible);
  //   });
  // });
  //
  // describe('getSubscriptionDatabase', () => {
  //   it('successfully get database from Redis Cloud subscriptions', async () => {
  //     mockedAxios.get.mockResolvedValue({
  //       status: 200,
  //       data: mockCloudCapiDatabase,
  //     });
  //
  //     expect(await service.getSubscriptionDatabase(
  //       mockCloudCapiAuthDto,
  //       mockGetCloudSubscriptionDatabaseDto,
  //     )).toEqual(mockCloudDatabase);
  //   });
  //   it('successfully get fixed database from Redis Cloud subscriptions', async () => {
  //     mockedAxios.get.mockResolvedValue({
  //       status: 200,
  //       data: mockCloudCapiDatabaseFixed,
  //     });
  //
  //     expect(await service.getSubscriptionDatabase(
  //       mockCloudCapiAuthDto,
  //       mockGetCloudSubscriptionDatabaseDtoFixed,
  //     )).toEqual(mockCloudDatabaseFixed);
  //   });
  //   it('the user could not be authenticated', async () => {
  //     mockedAxios.get.mockRejectedValue(mockApiUnauthenticatedResponse);
  //
  //     await expect(
  //       service.getSubscriptionDatabase(mockCloudCapiAuthDto, mockGetCloudSubscriptionDatabaseDto),
  //     ).rejects.toThrow(ForbiddenException);
  //   });
  //   it('database not found', async () => {
  //     const apiResponse = {
  //       message: `Subscription ${mockCloudSubscription.id} database ${mockCloudDatabase.databaseId} not found`,
  //       response: {
  //         status: 404,
  //       },
  //     };
  //     mockedAxios.get.mockRejectedValue(apiResponse);
  //
  //     await expect(
  //       service.getSubscriptionDatabase(mockCloudCapiAuthDto, mockGetCloudSubscriptionDatabaseDto),
  //     ).rejects.toThrow(NotFoundException);
  //   });
  // });
  //
  // describe('getSubscriptionDatabases', () => {
  //   it('successfully get cloud databases', async () => {
  //     mockedAxios.get.mockResolvedValue({
  //       status: 200,
  //       data: mockCloudApiSubscriptionDatabases,
  //     });
  //
  //     expect(await service.getSubscriptionDatabases(mockCloudCapiAuthDto, mockGetCloudSubscriptionDatabasesDto))
  //       .toEqual([mockCloudDatabaseFromList]);
  //   });
  //   it('successfully get cloud fixed databases', async () => {
  //     mockedAxios.get.mockResolvedValue({
  //       status: 200,
  //       data: mockCloudApiSubscriptionDatabasesFixed,
  //     });
  //
  //     expect(await service.getSubscriptionDatabases(mockCloudCapiAuthDto, mockGetCloudSubscriptionDatabasesDtoFixed))
  //       .toEqual([mockCloudDatabaseFromListFixed]);
  //   });
  //   it('the user could not be authenticated', async () => {
  //     mockedAxios.get.mockRejectedValue(mockApiUnauthenticatedResponse);
  //
  //     await expect(service.getSubscriptionDatabases(mockCloudCapiAuthDto, mockGetCloudSubscriptionDatabasesDto))
  //       .rejects.toThrow(ForbiddenException);
  //   });
  //   it('subscription not found', async () => {
  //     mockedAxios.get.mockRejectedValue({
  //       message: `Subscription ${mockCloudSubscription.id} not found`,
  //       response: {
  //         status: 404,
  //       },
  //     });
  //
  //     await expect(service.getSubscriptionDatabases(mockCloudCapiAuthDto, mockGetCloudSubscriptionDatabasesDto))
  //       .rejects.toThrow(NotFoundException);
  //   });
  // });
  //
  // describe('getDatabases', () => {
  //   beforeEach(() => {
  //     service.getSubscriptionDatabases = jest.fn().mockResolvedValue([]);
  //   });
  //   it('should call getSubscriptionDatabases 2 times', async () => {
  //     await service.getDatabases(mockCloudCapiAuthDto, {
  //       subscriptions: [
  //         { subscriptionId: 86070, subscriptionType: CloudSubscriptionType.Flexible },
  //         { subscriptionId: 86071, subscriptionType: CloudSubscriptionType.Flexible },
  //       ],
  //     });
  //
  //     expect(service.getSubscriptionDatabases).toHaveBeenCalledTimes(2);
  //   });
  //   it('should call getSubscriptionDatabases 2 times (different types)', async () => {
  //     await service.getDatabases(mockCloudCapiAuthDto, {
  //       subscriptions: [
  //         { subscriptionId: 86070, subscriptionType: CloudSubscriptionType.Flexible },
  //         { subscriptionId: 86071, subscriptionType: CloudSubscriptionType.Fixed },
  //       ],
  //     });
  //
  //     expect(service.getSubscriptionDatabases).toHaveBeenCalledTimes(2);
  //   });
  //   it('should call getSubscriptionDatabases 2 times (same id but different types)', async () => {
  //     await service.getDatabases(mockCloudCapiAuthDto, {
  //       subscriptions: [
  //         { subscriptionId: 86070, subscriptionType: CloudSubscriptionType.Flexible },
  //         { subscriptionId: 86070, subscriptionType: CloudSubscriptionType.Fixed },
  //       ],
  //     });
  //
  //     expect(service.getSubscriptionDatabases).toHaveBeenCalledTimes(2);
  //   });
  //   it('should call getSubscriptionDatabases 2 times (uniq by id and type)', async () => {
  //     await service.getDatabases(mockCloudCapiAuthDto, {
  //       subscriptions: [
  //         { subscriptionId: 86070, subscriptionType: CloudSubscriptionType.Flexible },
  //         { subscriptionId: 86071, subscriptionType: CloudSubscriptionType.Fixed },
  //         { subscriptionId: 86071, subscriptionType: CloudSubscriptionType.Fixed },
  //       ],
  //     });
  //
  //     expect(service.getSubscriptionDatabases).toHaveBeenCalledTimes(2);
  //   });
  //   it('subscription not found', async () => {
  //     service.getSubscriptionDatabases = jest
  //       .fn()
  //       .mockRejectedValue(new NotFoundException());
  //
  //     await expect(
  //       service.getDatabases(mockCloudCapiAuthDto, {
  //         subscriptions: [
  //           { subscriptionId: 86070, subscriptionType: CloudSubscriptionType.Flexible },
  //           { subscriptionId: 86071, subscriptionType: CloudSubscriptionType.Fixed },
  //         ],
  //       }),
  //     ).rejects.toThrow(NotFoundException);
  //   });
  // });
  //
  // describe('getApiError', () => {
  //   const title = 'Failed to get databases in RE cloud subscription';
  //   const mockError: AxiosError<any> = {
  //     name: '',
  //     message: mockUnauthenticatedErrorMessage,
  //     isAxiosError: true,
  //     config: null,
  //     response: {
  //       statusText: mockUnauthenticatedErrorMessage,
  //       data: null,
  //       headers: {},
  //       config: null,
  //       status: 401,
  //     },
  //     toJSON: () => null,
  //   };
  //   it('should throw ForbiddenException', async () => {
  //     const result = service['getApiError'](mockError, title);
  //
  //     expect(result).toBeInstanceOf(ForbiddenException);
  //   });
  //   it('should throw InternalServerErrorException from response', async () => {
  //     const errorMessage = 'Request failed with status code 500';
  //     const error = {
  //       ...mockError,
  //       message: errorMessage,
  //       response: {
  //         ...mockError.response,
  //         status: 500,
  //         statusText: errorMessage,
  //       },
  //     };
  //     const result = service['getApiError'](error, title);
  //
  //     expect(result).toBeInstanceOf(InternalServerErrorException);
  //   });
  //   it('should throw InternalServerErrorException', async () => {
  //     const error = {
  //       ...mockError,
  //       message: 'Request failed with status code 500',
  //       response: undefined,
  //     };
  //     const result = service['getApiError'](error, title);
  //
  //     expect(result).toBeInstanceOf(InternalServerErrorException);
  //   });
  //   it('should throw InternalServerErrorException with error from data', async () => {
  //     const error = {
  //       ...mockError,
  //       message: 'Request failed with status code 500',
  //       response: {
  //         data: {
  //           error: 'Service Unavailable',
  //         },
  //       },
  //     };
  //     const result = service['getApiError'](error as AxiosError, title);
  //
  //     expect(result).toBeInstanceOf(InternalServerErrorException);
  //   });
  // });
  //
  // describe('addRedisCloudDatabases', () => {
  //   let spy;
  //
  //   beforeEach(() => {
  //     spy = jest.spyOn(service, 'getSubscriptionDatabase');
  //   });
  //
  //   it('should successfully add 1 fixed and 1 flexible databases', async () => {
  //     spy.mockResolvedValueOnce(mockCloudDatabase);
  //     spy.mockResolvedValueOnce(mockCloudDatabaseFixed);
  //
  //     const result = await service.addRedisCloudDatabases(mockCloudCapiAuthDto, [
  //       mockImportCloudDatabaseDto,
  //       mockImportCloudDatabaseDtoFixed,
  //     ]);
  //
  //     expect(result).toEqual([
  //       mockImportCloudDatabaseResponse,
  //       mockImportCloudDatabaseResponseFixed,
  //     ]);
  //   });
  //
  //   it('should successfully add 1 fixed database and report 1 error without database details (404)', async () => {
  //     spy.mockRejectedValueOnce(new NotFoundException());
  //     spy.mockResolvedValueOnce(mockCloudDatabaseFixed);
  //
  //     const result = await service.addRedisCloudDatabases(mockCloudCapiAuthDto, [
  //       mockImportCloudDatabaseDto,
  //       mockImportCloudDatabaseDtoFixed,
  //     ]);
  //
  //     expect(result).toEqual([
  //       {
  //         ...mockImportCloudDatabaseResponse,
  //         error: {
  //           message: 'Not Found',
  //           statusCode: 404,
  //         },
  //         message: 'Not Found',
  //         status: 'fail',
  //         databaseDetails: undefined, // no database details when database wasn't fetched from cloud
  //       },
  //       mockImportCloudDatabaseResponseFixed,
  //     ]);
  //   });
  //
  //   it('should successfully add 1 fixed database and report 1 error with database details', async () => {
  //     spy.mockResolvedValueOnce(mockCloudDatabase);
  //     spy.mockResolvedValueOnce(mockCloudDatabaseFixed);
  //     databaseService.create.mockRejectedValueOnce(new Error('Connectivity issue'));
  //
  //     const result = await service.addRedisCloudDatabases(mockCloudCapiAuthDto, [
  //       mockImportCloudDatabaseDto,
  //       mockImportCloudDatabaseDtoFixed,
  //     ]);
  //
  //     expect(result).toEqual([
  //       {
  //         ...mockImportCloudDatabaseResponse,
  //         message: 'Connectivity issue',
  //         status: ActionStatus.Fail,
  //       },
  //       mockImportCloudDatabaseResponseFixed,
  //     ]);
  //   });
  //
  //   it('should successfully add 1 fixed database and report 1 error if db is not actives', async () => {
  //     spy.mockResolvedValueOnce({
  //       ...mockCloudDatabase,
  //       status: CloudDatabaseStatus.Pending,
  //     });
  //     spy.mockResolvedValueOnce(mockCloudDatabaseFixed);
  //
  //     const result = await service.addRedisCloudDatabases(mockCloudCapiAuthDto, [
  //       mockImportCloudDatabaseDto,
  //       mockImportCloudDatabaseDtoFixed,
  //     ]);
  //
  //     expect(result).toEqual([
  //       {
  //         ...mockImportCloudDatabaseResponse,
  //         error: {
  //           error: 'Service Unavailable',
  //           message: 'The database is inactive.',
  //           statusCode: 503,
  //         },
  //         message: 'The database is inactive.',
  //         status: ActionStatus.Fail,
  //         databaseDetails: {
  //           ...mockImportCloudDatabaseResponse.databaseDetails,
  //           status: CloudDatabaseStatus.Pending,
  //         },
  //       },
  //       mockImportCloudDatabaseResponseFixed,
  //     ]);
  //   });
  // });
});
