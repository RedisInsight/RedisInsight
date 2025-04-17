import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  mockAgreements,
  mockAgreementsEntity,
  mockRepository,
  mockSessionMetadata,
  MockType,
  mockUserId,
} from 'src/__mocks__';
import { AgreementsEntity } from 'src/modules/settings/entities/agreements.entity';
import { LocalAgreementsRepository } from 'src/modules/settings/repositories/local.agreements.repository';

describe('LocalAgreementsRepository', () => {
  let service: LocalAgreementsRepository;
  let repository: MockType<Repository<AgreementsEntity>>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalAgreementsRepository,
        {
          provide: getRepositoryToken(AgreementsEntity),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    repository = await module.get(getRepositoryToken(AgreementsEntity));
    service = await module.get(LocalAgreementsRepository);

    repository.findOneBy.mockResolvedValue(mockAgreementsEntity);
    repository.update.mockResolvedValue(true); // no meter of response
    repository.save.mockResolvedValue(
      Object.assign(new AgreementsEntity(), { id: mockUserId }),
    );
    repository.create.mockReturnValue(new AgreementsEntity());
  });

  describe('getOrCreate', () => {
    it('should return agreements', async () => {
      const result = await service.getOrCreate();

      expect(result).toEqual(mockAgreements);
    });
    it('should create new agreements', async () => {
      repository.findOneBy.mockResolvedValueOnce(null);

      const result = await service.getOrCreate();

      expect(result).toEqual({
        ...mockAgreements,
        version: undefined,
        data: undefined,
      });
    });
    it('should fail to create with unique constraint and return existing', async () => {
      repository.findOneBy.mockResolvedValueOnce(null);
      repository.findOneBy.mockResolvedValueOnce(mockAgreements);
      repository.save.mockRejectedValueOnce({ code: 'SQLITE_CONSTRAINT' });

      const result = await service.getOrCreate();

      expect(result).toEqual(mockAgreements);
    });
    it('should fail when failed to create new and error is not unique constraint', async () => {
      repository.findOneBy.mockResolvedValueOnce(null);
      repository.save.mockRejectedValueOnce(new Error());

      await expect(service.getOrCreate()).rejects.toThrow(Error);
    });
  });

  describe('update', () => {
    it('should update agreements', async () => {
      const result = await service.update(mockSessionMetadata, mockAgreements);

      expect(result).toEqual(mockAgreements);
      expect(repository.save).toHaveBeenCalledWith({
        ...mockAgreementsEntity,
      });
    });
  });
});
