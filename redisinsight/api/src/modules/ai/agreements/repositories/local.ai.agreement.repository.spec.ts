import { Test, TestingModule } from '@nestjs/testing';
import {
  mockAiAccountId,
  mockRepository,
  MockType,
  mockAiAgreement,
  mockAiAgreementEntity,
  mockSessionMetadata,
} from 'src/__mocks__';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiAgreementEntity } from 'src/modules/ai/agreements/entities/ai.agreement.entity';
import { LocalAiAgreementRepository } from './local.ai.agreement.repository';

describe('LocalAiAgreementRespository', () => {
  let service: LocalAiAgreementRepository;
  let repository: MockType<Repository<AiAgreementEntity>>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalAiAgreementRepository,
        {
          provide: getRepositoryToken(AiAgreementEntity),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get(LocalAiAgreementRepository);
    repository = module.get(getRepositoryToken(AiAgreementEntity));
  });

  describe('get', () => {
    it('should get Ai agreement by accountId', async () => {
      repository.findOneBy.mockResolvedValueOnce(mockAiAgreementEntity);
      await expect(service.get(mockSessionMetadata, mockAiAccountId))
        .resolves.toEqual(mockAiAgreement);
    });

    it('should return null if no agreement with given accountId found', async () => {
      repository.findOneBy.mockResolvedValueOnce(undefined);

      await expect(service.get(mockSessionMetadata, mockAiAccountId))
        .resolves.toEqual(null);
    });
  });

  describe('save', () => {
    it('should create or update Ai agreement by databaseId and accountId', async () => {
      repository.save.mockResolvedValueOnce(mockAiAgreementEntity);
      await expect(service.save(mockSessionMetadata, mockAiAgreement))
        .resolves.toEqual(mockAiAgreement);
    });
  });
});
