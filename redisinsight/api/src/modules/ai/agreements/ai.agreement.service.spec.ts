import { Test, TestingModule } from '@nestjs/testing';
import {
  mockCloudUserApiService,
  mockSessionMetadata,
  mockAiAgreementRepository,
  MockType,
  mockAiAgreement,
} from 'src/__mocks__';
import { LocalAiAuthProvider } from 'src/modules/ai/auth/local.ai-auth.provider';
import { CloudUserApiService } from 'src/modules/cloud/user/cloud-user.api.service';
import { CloudApiUnauthorizedException } from 'src/modules/cloud/common/exceptions';
import { AiAuthProvider } from 'src/modules/ai/auth/ai-auth.provider';
import { AiAgreementService } from './ai.agreement.service';
import { AiAgreementRepository } from './repositories/ai.agreement.repository';

describe('AiAgreementService', () => {
  let service: AiAgreementService;
  let cloudUserApiService: MockType<CloudUserApiService>;
  let aiAgreementRepository: MockType<AiAgreementRepository>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiAgreementService,
        {
          provide: AiAuthProvider,
          useClass: LocalAiAuthProvider,
        },
        {
          provide: AiAgreementRepository,
          useFactory: mockAiAgreementRepository,
        },
        {
          provide: CloudUserApiService,
          useFactory: mockCloudUserApiService,
        },
      ],
    }).compile();

    service = module.get(AiAgreementService);
    cloudUserApiService = module.get(CloudUserApiService);
    aiAgreementRepository = module.get(AiAgreementRepository);
  });

  describe('getAiAgreement', () => {
    it('should get ai agreemet of a given account', async () => {
      aiAgreementRepository.get.mockResolvedValue(mockAiAgreement);
      expect(await service.getAiAgreement(mockSessionMetadata))
        .toEqual(mockAiAgreement);
    });

    it('throw CloudApiUnauthorizedException', async () => {
      cloudUserApiService.getUserSession.mockRejectedValueOnce(new CloudApiUnauthorizedException());
      cloudUserApiService.getUserSession.mockRejectedValueOnce(new CloudApiUnauthorizedException());

      await expect(service.getAiAgreement(mockSessionMetadata)).rejects.toThrow(
        CloudApiUnauthorizedException,
      );
    });
  });

  describe('saveAiAgreement', () => {
    it('should create ai agreemet of a given account', async () => {
      aiAgreementRepository.get.mockResolvedValue(mockAiAgreement);
      expect(await service.saveAiAgreement(mockSessionMetadata, { consent: true }))
        .toEqual(mockAiAgreement);
    });

    it('throw CloudApiUnauthorizedException', async () => {
      cloudUserApiService.getUserSession.mockRejectedValueOnce(new CloudApiUnauthorizedException());
      cloudUserApiService.getUserSession.mockRejectedValueOnce(new CloudApiUnauthorizedException());

      await expect(service.saveAiAgreement(mockSessionMetadata, { consent: true })).rejects.toThrow(
        CloudApiUnauthorizedException,
      );
    });
  });
});
