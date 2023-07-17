import { Test, TestingModule } from '@nestjs/testing';
import {
  mockCloudAccountInfo, mockCloudApiAuthDto,
  mockCloudCapiAuthDto, mockCloudSessionService, mockCloudUserApiProvider,
  mockCloudUserCapiProvider, mockCloudUserRepository, mockSessionMetadata,
  MockType
} from 'src/__mocks__';
import { CloudApiUnauthorizedException } from 'src/modules/cloud/common/exceptions';
import { CloudUserApiService } from 'src/modules/cloud/user/cloud-user.api.service';
import { CloudUserApiProvider } from 'src/modules/cloud/user/providers/cloud-user.api.provider';
import { CloudUserRepository } from 'src/modules/cloud/user/repositories/cloud-user.repository';
import { CloudSessionService } from 'src/modules/cloud/session/cloud-session.service';

describe('CloudUserApiService', () => {
  let service: CloudUserApiService;
  let apiProvider: MockType<CloudUserApiProvider>;
  let repository: MockType<CloudUserRepository>;
  let sessionService: MockType<CloudSessionService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudUserApiService,
        {
          provide: CloudUserApiProvider,
          useFactory: mockCloudUserApiProvider,
        },
        {
          provide: CloudUserRepository,
          useFactory: mockCloudUserRepository,
        },
        {
          provide: CloudSessionService,
          useFactory: mockCloudSessionService,
        },
      ],
    }).compile();

    service = module.get(CloudUserApiService);
    apiProvider = module.get(CloudUserApiProvider);
    repository = module.get(CloudUserRepository);
    sessionService = module.get(CloudSessionService);
  });

  describe('ensureCsrf', () => {
    it('successfully get list of capi keys', async () => {
      expect(await service['ensureCsrf'](mockSessionMetadata)).toEqual(mockCloudAccountInfo);
    });
    // it('throw CloudApiUnauthorizedException exception', async () => {
    //   apiProvider.getCurrentAccount.mockRejectedValueOnce(new CloudApiUnauthorizedException());
    //   await expect(service.getCurrentAccount(mockCloudCapiAuthDto)).rejects.toThrow(
    //     CloudApiUnauthorizedException,
    //   );
    // });
  });
});
