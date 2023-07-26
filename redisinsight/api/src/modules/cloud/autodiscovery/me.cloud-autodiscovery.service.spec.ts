import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import {
  mockCloudAccountInfo,
  mockCloudAutodiscoveryAnalytics, mockCloudAutodiscoveryService,
  mockCloudCapiAuthDto,
  mockCloudDatabase, mockCloudDatabaseCapiService,
  mockCloudDatabaseFixed,
  mockCloudSubscription, mockCloudSubscriptionCapiService, mockCloudSubscriptionFixed, mockCloudUserApiService,
  mockCloudUserCapiService,
  mockDatabaseService,
  mockImportCloudDatabaseDto, mockImportCloudDatabaseDtoFixed,
  mockImportCloudDatabaseResponse,
  mockImportCloudDatabaseResponseFixed, mockSessionMetadata,
  MockType
} from 'src/__mocks__';
import { DatabaseService } from 'src/modules/database/database.service';
import { CloudAutodiscoveryService } from 'src/modules/cloud/autodiscovery/cloud-autodiscovery.service';
import { CloudAutodiscoveryAnalytics } from 'src/modules/cloud/autodiscovery/cloud-autodiscovery.analytics';
import { ActionStatus } from 'src/common/models';
import { CloudSubscriptionType } from 'src/modules/cloud/subscription/models';
import { CloudAutodiscoveryAuthType } from 'src/modules/cloud/autodiscovery/models';
import { CloudDatabaseStatus } from 'src/modules/cloud/database/models';
import {
  CloudApiBadRequestException,
  CloudApiForbiddenException, CloudApiInternalServerErrorException,
  CloudApiUnauthorizedException
} from 'src/modules/cloud/common/exceptions';
import { MeCloudAutodiscoveryService } from 'src/modules/cloud/autodiscovery/me.cloud-autodiscovery.service';
import { CloudUserApiService } from 'src/modules/cloud/user/cloud-user.api.service';

describe('MeCloudAutodiscoveryService', () => {
  let service: MeCloudAutodiscoveryService;
  let cloudAutodiscoveryService: MockType<CloudAutodiscoveryService>;
  let cloudUserApiService: MockType<CloudUserApiService>;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeCloudAutodiscoveryService,
        {
          provide: CloudAutodiscoveryService,
          useFactory: mockCloudAutodiscoveryService,
        },
        {
          provide: CloudUserApiService,
          useFactory: mockCloudUserApiService,
        },
      ],
    }).compile();

    service = module.get(MeCloudAutodiscoveryService);
    cloudAutodiscoveryService = module.get(CloudAutodiscoveryService);
    cloudUserApiService = module.get(CloudUserApiService);
  });

  describe('getAccount', () => {
    it('successfully get cloud account info', async () => {
      expect(await service.getAccount(mockSessionMetadata)).toEqual(mockCloudAccountInfo);
    });
    it('should throw CloudApiUnauthorizedException exception', async () => {
      cloudUserApiService.getCapiKeys.mockRejectedValueOnce(new CloudApiUnauthorizedException());
      await expect(service.getAccount(mockSessionMetadata)).rejects.toThrow(
        CloudApiUnauthorizedException,
      );
    });
    it('should throw CloudApiForbiddenException exception', async () => {
      cloudAutodiscoveryService.getAccount.mockRejectedValueOnce(new CloudApiForbiddenException());
      await expect(service.getAccount(mockSessionMetadata)).rejects.toThrow(
        CloudApiForbiddenException,
      );
    });
  });
  describe('discoverSubscriptions', () => {
    it('successfully discover fixed and flexible cloud subscriptions', async () => {
      expect(await service.discoverSubscriptions(
        mockSessionMetadata,
      )).toEqual([mockCloudSubscription, mockCloudSubscriptionFixed]);
      expect(cloudAutodiscoveryService.discoverSubscriptions).toHaveBeenCalledWith(
        mockCloudCapiAuthDto,
        CloudAutodiscoveryAuthType.Sso,
      );
    });
    it('should throw CloudApiUnauthorizedException exception', async () => {
      cloudUserApiService.getCapiKeys.mockRejectedValueOnce(new CloudApiUnauthorizedException());
      await expect(service.discoverSubscriptions(mockSessionMetadata)).rejects.toThrow(
        CloudApiUnauthorizedException,
      );
    });
    it('should throw CloudApiForbiddenException exception', async () => {
      cloudAutodiscoveryService.discoverSubscriptions.mockRejectedValueOnce(new CloudApiForbiddenException());
      await expect(service.discoverSubscriptions(mockSessionMetadata)).rejects.toThrow(
        CloudApiForbiddenException,
      );
    });
  });
  describe('discoverDatabases', () => {
    it('should call getDatabases 2 times', async () => {
      expect(await service.discoverDatabases(
        mockSessionMetadata,
        {
          subscriptions: [
            {
              subscriptionId: 86070,
              subscriptionType: CloudSubscriptionType.Flexible,
              free: false,
            },
            {
              subscriptionId: 86071,
              subscriptionType: CloudSubscriptionType.Fixed,
              free: true,
            },
          ],
        },
      )).toEqual([mockCloudDatabase, mockCloudDatabaseFixed]);

      expect(cloudAutodiscoveryService.discoverDatabases).toHaveBeenCalledWith(
        mockCloudCapiAuthDto,
        {
          subscriptions: [
            {
              subscriptionId: 86070,
              subscriptionType: CloudSubscriptionType.Flexible,
              free: false,
            },
            {
              subscriptionId: 86071,
              subscriptionType: CloudSubscriptionType.Fixed,
              free: true,
            },
          ],
        },
        CloudAutodiscoveryAuthType.Sso,
      );
    });
    it('should throw CloudApiUnauthorizedException exception', async () => {
      cloudUserApiService.getCapiKeys.mockRejectedValueOnce(new CloudApiUnauthorizedException());
      await expect(service.discoverDatabases(
        mockSessionMetadata,
        {
          subscriptions: [
            {
              subscriptionId: 86070,
              subscriptionType: CloudSubscriptionType.Flexible,
              free: false,
            },
          ],
        },
      )).rejects.toThrow(
        CloudApiUnauthorizedException,
      );
    });
    it('should throw CloudApiBadRequestException exception', async () => {
      cloudAutodiscoveryService.discoverDatabases.mockRejectedValueOnce(new CloudApiBadRequestException());
      await expect(service.discoverDatabases(
        mockSessionMetadata,
        {
          subscriptions: [
            {
              subscriptionId: 86070,
              subscriptionType: CloudSubscriptionType.Flexible,
              free: false,
            },
          ],
        },
      )).rejects.toThrow(
        CloudApiBadRequestException,
      );
    });
  });
  describe('addRedisCloudDatabases', () => {
    it('should successfully add 1 fixed and 1 flexible databases', async () => {
      const result = await service.addRedisCloudDatabases(mockSessionMetadata, [
        mockImportCloudDatabaseDto,
        mockImportCloudDatabaseDtoFixed,
      ]);

      expect(result).toEqual([
        mockImportCloudDatabaseResponse,
        mockImportCloudDatabaseResponseFixed,
      ]);

      expect(cloudAutodiscoveryService.addRedisCloudDatabases).toHaveBeenCalledWith(
        mockCloudCapiAuthDto,
        [
          mockImportCloudDatabaseDto,
          mockImportCloudDatabaseDtoFixed,
        ],
      );
    });
    it('should throw CloudApiUnauthorizedException exception', async () => {
      cloudUserApiService.getCapiKeys.mockRejectedValueOnce(new CloudApiUnauthorizedException());
      await expect(service.addRedisCloudDatabases(
        mockSessionMetadata,
        [
          mockImportCloudDatabaseDto,
          mockImportCloudDatabaseDtoFixed,
        ],
      )).rejects.toThrow(
        CloudApiUnauthorizedException,
      );
    });
    it('should throw CloudApiInternalServerErrorException exception', async () => {
      cloudAutodiscoveryService.addRedisCloudDatabases
        .mockRejectedValueOnce(new CloudApiInternalServerErrorException());
      await expect(service.addRedisCloudDatabases(
        mockSessionMetadata,
        [
          mockImportCloudDatabaseDto,
          mockImportCloudDatabaseDtoFixed,
        ],
      )).rejects.toThrow(
        CloudApiInternalServerErrorException,
      );
    });
  });
});
