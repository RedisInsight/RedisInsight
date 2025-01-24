import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  mockDatabaseId, mockDatabaseSettingsCreateDto,
  mockDatabaseSettingsDto,
  mockDatabaseSettingsEntity,
  mockRepository,
  mockSessionMetadata,
  MockType,
} from 'src/__mocks__';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import {
  LocalDatabaseSettingsRepository,
} from './repositories/local-database-settings.repository';
import { DatabaseSettingsEntity } from './entities/database-setting.entity';
import { DatabaseSettingsService } from './database-settings.service';
import { DatabaseSettingsRepository } from './repositories/database-settings.repository';

describe('DatabaseSettingsService', () => {
  let service: DatabaseSettingsService;
  let repository: MockType<Repository<DatabaseSettingsEntity>>;
  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalDatabaseSettingsRepository,
        {
          provide: getRepositoryToken(DatabaseSettingsEntity),
          useFactory: mockRepository,
        },
        DatabaseSettingsService,
        {
          provide: DatabaseSettingsRepository,
          useClass: LocalDatabaseSettingsRepository,
        },
      ],
    }).compile();
    service = await module.get(DatabaseSettingsService);
    repository = await module.get(getRepositoryToken(DatabaseSettingsEntity));

    repository.findOneBy.mockResolvedValue(mockDatabaseSettingsEntity);
    repository.save.mockResolvedValue(mockDatabaseSettingsEntity);
    repository.delete.mockImplementation(() => {
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('get', () => {
    it('should return database settings entity when it exists', async () => {
      const actual = await service.get(mockSessionMetadata, mockDatabaseId);
      const expected = mockDatabaseSettingsDto();
      expect(actual).toEqual(expected);
      expect(repository.findOneBy).toHaveBeenCalledWith({ databaseId: mockDatabaseId });
    });

    it('should throw NotFoundException when database setting is not found', async () => {
      repository.findOneBy.mockResolvedValueOnce(null);
      await expect(service.get(mockSessionMetadata, mockDatabaseId))
        .rejects.toThrow(NotFoundException);
    });
  });
  describe('createOrUpdate', () => {
    it('should create new database settings entity when it does not exist', async () => {
      repository.findOneBy.mockResolvedValueOnce(null);
      const actual = await service.createOrUpdate(mockSessionMetadata, mockDatabaseId, mockDatabaseSettingsCreateDto);
      const expected = mockDatabaseSettingsDto();
      expect(actual).toEqual(expected);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should update existing database settings entity', async () => {
      repository.save.mockResolvedValue({
        ...mockDatabaseSettingsEntity,
        data: { key: '1' },
      });
      const updateDto = {
        ...mockDatabaseSettingsCreateDto,
        data: { key: '1' },
      };
      const result = await service.createOrUpdate(mockSessionMetadata, mockDatabaseId, updateDto);
      expect(result.data)
        .toEqual({ key: '1' });
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete database settings entity', async () => {
      await expect(service.delete(mockSessionMetadata, mockDatabaseId)).resolves.not.toThrow();
    });

    it('should throw when database setting is not found', async () => {
      repository.delete.mockImplementationOnce(() => {
        throw new Error('Error');
      });
      await expect(service.delete(mockSessionMetadata, mockDatabaseId))
        .rejects.toThrow(InternalServerErrorException);
    });
  });
});
