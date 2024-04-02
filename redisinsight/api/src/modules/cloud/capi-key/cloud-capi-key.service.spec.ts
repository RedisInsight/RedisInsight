import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CloudCapiKeyService } from 'src/modules/cloud/capi-key/cloud-capi-key.service';
import { CloudCapiKeyApiProvider } from 'src/modules/cloud/capi-key/cloud-capi-key.api.provider';
import { CloudCapiKeyRepository } from 'src/modules/cloud/capi-key/repository/cloud-capi-key.repository';
import {
  mockCloudCapiKey,
  mockCloudCapiKeyAnalytics,
  mockCloudSessionService,
  mockCloudUserApiService,
  mockServerService,
  mockSessionMetadata,
  mockCloudUser,
  mockUtm,
  MockType,
  mockCloudCapiKeyRepository,
  mockCloudCapiKeyApiProvider,
} from 'src/__mocks__';
import { CloudUserApiService } from 'src/modules/cloud/user/cloud-user.api.service';
import { CloudSessionService } from 'src/modules/cloud/session/cloud-session.service';
import { ServerService } from 'src/modules/server/server.service';
import { CloudCapiKeyAnalytics } from 'src/modules/cloud/capi-key/cloud-capi-key.analytics';
import { CloudApiBadRequestException } from 'src/modules/cloud/common/exceptions';

describe('CloudCapiKeyService', () => {
  let service: CloudCapiKeyService;
  let api: CloudCapiKeyApiProvider;
  let repository: CloudCapiKeyRepository;
  let cloudUserApiService: MockType<CloudUserApiService>;
  let cloudSessionService: CloudSessionService;
  let serverService: ServerService;
  let analytics: CloudCapiKeyAnalytics;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudCapiKeyService,
        {
          provide: CloudCapiKeyApiProvider,
          useFactory: mockCloudCapiKeyApiProvider,
        },
        {
          provide: CloudCapiKeyRepository,
          useFactory: mockCloudCapiKeyRepository,
        },
        {
          provide: CloudUserApiService,
          useFactory: mockCloudUserApiService,
        },
        {
          provide: CloudSessionService,
          useFactory: mockCloudSessionService,
        },
        {
          provide: ServerService,
          useFactory: mockServerService,
        },
        {
          provide: CloudCapiKeyAnalytics,
          useFactory: mockCloudCapiKeyAnalytics,
        },
      ],
    }).compile();

    service = await module.get(CloudCapiKeyService);
    api = await module.get(CloudCapiKeyApiProvider);
    repository = await module.get(CloudCapiKeyRepository);
    cloudUserApiService = await module.get(CloudUserApiService);
    cloudSessionService = await module.get(CloudSessionService);
    serverService = await module.get(ServerService);
    analytics = await module.get(CloudCapiKeyAnalytics);
  });

  describe('generateName', () => {
    it('successfully generate capi key name', async () => {
      expect(await service['generateName'](mockCloudCapiKey))
        .toEqual(mockCloudCapiKey.name);
    });
  });

  describe('ensureCapiKeys', () => {
    it('Should return exist capi key', async () => {
      expect(await service['ensureCapiKeys'](mockSessionMetadata, mockUtm))
        .toEqual(mockCloudUser.capiKey);
    });
    it('Should throw CloudApiBadRequestException', async () => {
      cloudUserApiService.me.mockResolvedValue(null);
      CloudUserApiService.getCurrentAccount(null);
      await expect(service['ensureCapiKeys'](mockSessionMetadata, mockUtm))
        .rejects.toThrowError(CloudApiBadRequestException);
    });
  });

  describe('handleCapiKeyUnauthorizedError', () => {
    it('should show BadRequestException error', async () => {
      const mockError = new BadRequestException('error');
      expect(await service.handleCapiKeyUnauthorizedError(mockError, mockSessionMetadata))
        .toEqual(new BadRequestException('error'));
    });
  });
});
