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
    it('should return database settings entity', async () => {
      const actual = await service.get(mockSessionMetadata, mockDatabaseId);
      const expected = mockDatabaseSettingsDto();
      expect(actual).toEqual(expected);
    });

    it('should throw when database setting is not found', async () => {
      repository.findOneBy.mockResolvedValueOnce(null);
      await expect(service.get(mockSessionMetadata, mockDatabaseId)).rejects.toThrow(NotFoundException);
    });
  });
  describe('createOrUpdate', () => {
    it('should be able to create database settings entity', async () => {
      repository.findOneBy.mockResolvedValueOnce(null);
      const actual = await service.createOrUpdate(mockSessionMetadata, mockDatabaseId, mockDatabaseSettingsCreateDto);
      const expected = mockDatabaseSettingsDto();
      expect(actual).toEqual(expected);
    });

    it('should be able to update database setting', async () => {
      const update = mockDatabaseSettingsDto();
      update.data = { key: '1' };
      expect(await service.createOrUpdate(mockSessionMetadata, mockDatabaseId, mockDatabaseSettingsCreateDto))
        .toEqual(mockDatabaseSettingsDto());
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
