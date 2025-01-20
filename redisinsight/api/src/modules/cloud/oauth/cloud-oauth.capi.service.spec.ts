import { Test, TestingModule } from '@nestjs/testing';
import {
  mockCloudAccountInfo,
  mockCloudCapiAuthDto,
  mockCloudUserCapiProvider,
  MockType,
} from 'src/__mocks__';
import { CloudOauthCapiService } from 'src/modules/cloud/oauth/cloud-oauth.capi.service';
import { CloudUserCapiProvider } from 'src/modules/cloud/oauth/providers/cloud-user.capi.provider';
import { CloudApiUnauthorizedException } from 'src/modules/cloud/common/exceptions';

describe('CloudUserCapiService', () => {
  let service: CloudOauthCapiService;
  let capiProvider: MockType<CloudUserCapiProvider>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudOauthCapiService,
        {
          provide: CloudUserCapiProvider,
          useFactory: mockCloudUserCapiProvider,
        },
      ],
    }).compile();

    service = module.get(CloudOauthCapiService);
    capiProvider = module.get(CloudUserCapiProvider);
  });

  describe('getCurrentAccount', () => {
    it('successfully get current account info', async () => {
      expect(await service.getCurrentAccount(mockCloudCapiAuthDto)).toEqual(mockCloudAccountInfo);
    });
    it('throw CloudApiUnauthorizedException exception', async () => {
      capiProvider.getCurrentAccount.mockRejectedValueOnce(new CloudApiUnauthorizedException());
      await expect(service.getCurrentAccount(mockCloudCapiAuthDto)).rejects.toThrow(
        CloudApiUnauthorizedException,
      );
    });
  });
});
