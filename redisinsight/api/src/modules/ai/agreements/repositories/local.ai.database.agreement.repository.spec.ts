import { Test, TestingModule } from '@nestjs/testing';
import {
  mockAiAccountId,
  mockAiDatabaseId,
  mockRepository,
  MockType,
  mockSessionMetadata,
  mockAiDatabaseAgreementEntity,
  mockAiDatabaseAgreement,
} from 'src/__mocks__';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocalAiDatabaseAgreementRepository } from './local.ai.database.agreement.repository';
import { AiDatabaseAgreementEntity } from '../entities/ai.database.agreement.entity';

describe('LocalAiDatabaseAgreementRepository', () => {
  let service: LocalAiDatabaseAgreementRepository;
  let repository: MockType<Repository<AiDatabaseAgreementEntity>>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalAiDatabaseAgreementRepository,
        {
          provide: getRepositoryToken(AiDatabaseAgreementEntity),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get(LocalAiDatabaseAgreementRepository);
    repository = module.get(getRepositoryToken(AiDatabaseAgreementEntity));
  });

  describe('get', () => {
    it('should get Ai database agreement by databaseId and accountId', async () => {
      repository.findOneBy.mockResolvedValueOnce(mockAiDatabaseAgreementEntity);
      await expect(service.get(mockSessionMetadata, mockAiDatabaseId, mockAiAccountId))
        .resolves.toEqual(mockAiDatabaseAgreement);
    });

    it('should return null if no agreement with given databaseId and accountId found', async () => {
      repository.findOneBy.mockResolvedValueOnce(undefined);

      await expect(service.get(mockSessionMetadata, mockAiDatabaseId, mockAiAccountId))
        .resolves.toEqual(null);
    });
  });

  describe('save', () => {
    it('should create or update Ai database agreement by databaseId and accountId', async () => {
      repository.save.mockResolvedValueOnce(mockAiDatabaseAgreementEntity);
      await expect(service.save(mockSessionMetadata, mockAiDatabaseAgreement))
        .resolves.toEqual(mockAiDatabaseAgreement);
    });
  });
});
