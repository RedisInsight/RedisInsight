import { Test, TestingModule } from '@nestjs/testing';
import { CloudCapiKeyService } from 'src/modules/cloud/capi-key/cloud-capi-key.service';
import { CloudCapiKeyApiProvider } from 'src/modules/cloud/capi-key/cloud-capi-key.api.provider';
import { CloudCapiKeyRepository } from 'src/modules/cloud/capi-key/repository/cloud-capi-key.repository';
import {
  mockCloudCapiKey, mockCloudCapiKeyAnalytics,
  mockCloudSessionService, mockCloudUserApiService, mockRepository, mockServerService,
} from 'src/__mocks__';
import { CloudUserApiService } from 'src/modules/cloud/user/cloud-user.api.service';
import { CloudSessionService } from 'src/modules/cloud/session/cloud-session.service';
import { ServerService } from 'src/modules/server/server.service';
import { CloudCapiKeyAnalytics } from 'src/modules/cloud/capi-key/cloud-capi-key.analytics';

describe('CloudCapiKeyService', () => {
  let service: CloudCapiKeyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudCapiKeyService,
        {
          provide: CloudCapiKeyApiProvider,
          useFactory: jest.fn(),
        },
        {
          provide: CloudCapiKeyRepository,
          useFactory: mockRepository,
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

    service = module.get(CloudCapiKeyService);
  });

  describe('generateName', () => {
    it('successfully get cloud databases', async () => {
      expect(await service['generateName'](mockCloudCapiKey))
        .toEqual(mockCloudCapiKey.name);
    });
  });
});
