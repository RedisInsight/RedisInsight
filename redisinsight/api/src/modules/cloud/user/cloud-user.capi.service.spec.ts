import { Test, TestingModule } from '@nestjs/testing';
import {
  mockCloudAccountInfo,
  mockCloudCapiAuthDto,
  mockCloudUserCapiProvider,
  mockLoggerService,
  MockType,
} from 'src/__mocks__';
import { CloudUserCapiService } from 'src/modules/cloud/user/cloud-user.capi.service';
import { CloudUserCapiProvider } from 'src/modules/cloud/user/providers/cloud-user.capi.provider';
import { CloudApiUnauthorizedException } from 'src/modules/cloud/common/exceptions';
import { LoggerService } from 'src/modules/logger/logger.service';

describe('CloudUserCapiService', () => {
  let service: CloudUserCapiService;
  let capiProvider: MockType<CloudUserCapiProvider>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudUserCapiService,
        {
          provide: LoggerService,
          useValue: mockLoggerService,
        },
        {
          provide: CloudUserCapiProvider,
          useFactory: mockCloudUserCapiProvider,
        },
      ],
    }).compile();

    service = module.get(CloudUserCapiService);
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
