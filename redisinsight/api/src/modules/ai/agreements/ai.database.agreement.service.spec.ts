import { Test, TestingModule } from '@nestjs/testing';
import {
  mockCloudUserApiService,
  mockSessionMetadata,
  MockType,
  mockAiDatabaseAgreementRepository,
  mockDatabaseId,
  mockAiDatabaseAgreement,
} from 'src/__mocks__';
import { LocalAiAuthProvider } from 'src/modules/ai/auth/local.ai-auth.provider';
import { CloudUserApiService } from 'src/modules/cloud/user/cloud-user.api.service';
import { CloudApiUnauthorizedException } from 'src/modules/cloud/common/exceptions';
import { AiAuthProvider } from 'src/modules/ai/auth/ai-auth.provider';
import { AiDatabaseAgreementService } from './ai.database.agreement.service';
import { AiDatabaseAgreementRepository } from './repositories/ai.database.agreement.repository';

describe('AiDatabaseAgreementService', () => {
  let service: AiDatabaseAgreementService;
  let cloudUserApiService: MockType<CloudUserApiService>;
  let aiDatabaseAgreementRepository: MockType<AiDatabaseAgreementRepository>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiDatabaseAgreementService,
        {
          provide: AiAuthProvider,
          useClass: LocalAiAuthProvider,
        },
        {
          provide: AiDatabaseAgreementRepository,
          useFactory: mockAiDatabaseAgreementRepository,
        },
        {
          provide: CloudUserApiService,
          useFactory: mockCloudUserApiService,
        },
      ],
    }).compile();

    service = module.get(AiDatabaseAgreementService);
    cloudUserApiService = module.get(CloudUserApiService);
    aiDatabaseAgreementRepository = module.get(AiDatabaseAgreementRepository);
  });

  describe('getAiDatabaseAgreement', () => {
    it('should get ai agreemet of a given account', async () => {
      aiDatabaseAgreementRepository.get.mockResolvedValue(mockAiDatabaseAgreement);
      expect(await service.getAiDatabaseAgreement(mockSessionMetadata, mockDatabaseId))
        .toEqual(mockAiDatabaseAgreement);
    });

    it('throw CloudApiUnauthorizedException', async () => {
      cloudUserApiService.getUserSession.mockRejectedValueOnce(new CloudApiUnauthorizedException());
      cloudUserApiService.getUserSession.mockRejectedValueOnce(new CloudApiUnauthorizedException());

      await expect(service.getAiDatabaseAgreement(mockSessionMetadata, mockDatabaseId)).rejects.toThrow(
        CloudApiUnauthorizedException,
      );
    });
  });

  describe('saveAiDatabaseAgreement', () => {
    it('should create ai agreemet of a given account', async () => {
      aiDatabaseAgreementRepository.get.mockResolvedValue(mockAiDatabaseAgreement);
      expect(await service.saveAiDatabaseAgreement(mockSessionMetadata, mockDatabaseId, { dataConsent: true }))
        .toEqual(mockAiDatabaseAgreement);
    });

    it('throw CloudApiUnauthorizedException', async () => {
      cloudUserApiService.getUserSession.mockRejectedValueOnce(new CloudApiUnauthorizedException());
      cloudUserApiService.getUserSession.mockRejectedValueOnce(new CloudApiUnauthorizedException());

      await expect(service.saveAiDatabaseAgreement(mockSessionMetadata, mockDatabaseId, { dataConsent: true }))
        .rejects.toThrow(CloudApiUnauthorizedException);
    });
  });
});
