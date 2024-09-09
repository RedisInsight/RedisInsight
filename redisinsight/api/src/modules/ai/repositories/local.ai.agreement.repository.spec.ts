import { Test, TestingModule } from '@nestjs/testing';
import {
  mockAiAccountId,
  mockAiDatabaseId,
  mockRepository,
  MockType,
  mockAiAgreement,
  mockAiAgreementEntity,
} from 'src/__mocks__';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocalAiAgreementRepository } from 'src/modules/ai/repositories/local.ai.agreement.repository';
import { AiAgreementEntity } from 'src/modules/ai/entities/ai.agreement.entity';

describe('LocalAiAuthProvider', () => {
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
    it('should get Ai agreement by databaseId and accountId', async () => {
      repository.findOneBy.mockResolvedValueOnce(mockAiAgreementEntity);
      await expect(service.get(mockAiDatabaseId, mockAiAccountId))
        .resolves.toEqual(mockAiAgreement);
    });

    it('should return null if no agreement with given databaseId and accountId found', async () => {
      repository.findOneBy.mockResolvedValueOnce(undefined);

      await expect(service.get(mockAiDatabaseId, mockAiAccountId))
        .resolves.toEqual(null);
    });
  });

  describe('create', () => {
    it('should create Ai agreement by databaseId and accountId', async () => {
      repository.save.mockResolvedValueOnce(mockAiAgreementEntity);
      await expect(service.create(mockAiDatabaseId, mockAiAccountId))
        .resolves.toEqual(mockAiAgreement);
    });
  });
});
