import { Test, TestingModule } from '@nestjs/testing';
import { CloudCapiKeyService } from 'src/modules/cloud/capi-key/cloud-capi-key.service';
import { CloudCapiKeyApiProvider } from 'src/modules/cloud/capi-key/cloud-capi-key.api.provider';
import { CloudCapiKeyRepository } from 'src/modules/cloud/capi-key/repository/cloud-capi-key.repository';
import {
  mockCloudSessionService, mockCloudUserApiService, mockRepository, mockServerService,
} from 'src/__mocks__';
import { CloudUserApiService } from 'src/modules/cloud/user/cloud-user.api.service';
import { CloudSessionService } from 'src/modules/cloud/session/cloud-session.service';
import { ServerService } from 'src/modules/server/server.service';

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
      ],
    }).compile();

    service = module.get(CloudCapiKeyService);
  });

  describe('generateName', () => {
    it('successfully get cloud databases', async () => {
      expect(await service['generateName'](
        {
          createdAt: new Date('2020-01-01T00:00:00.000Z'),
        },
      )).toEqual('RedisInsight-ddc341ba-c2a0-1577836800000');
    });
  });
});
