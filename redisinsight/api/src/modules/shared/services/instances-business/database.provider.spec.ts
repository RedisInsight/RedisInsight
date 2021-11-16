import { Test, TestingModule } from '@nestjs/testing';
import {
  mockDataToEncrypt, mockEncryptionService,
  mockEncryptResult,
  mockQueryBuilderGetMany,
  mockQueryBuilderGetOne,
  mockRepository,
  mockStandaloneDatabaseEntity,
  MockType,
} from 'src/__mocks__';
import { DatabasesProvider } from 'src/modules/shared/services/instances-business/databases.provider';
import { EncryptionService } from 'src/modules/core/encryption/encryption.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DatabaseInstanceEntity } from 'src/modules/core/models/database-instance.entity';
import { Repository } from 'typeorm';
import { KeytarUnavailableException } from 'src/modules/core/encryption/exceptions';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockDatabaseEntity = {
  ...mockStandaloneDatabaseEntity,
  password: mockEncryptResult.data,
  sentinelMasterPassword: mockEncryptResult.data,
};

describe('DatabasesProvider', () => {
  let service: DatabasesProvider;
  let repository: MockType<Repository<DatabaseInstanceEntity>>;
  let encryptionService: MockType<EncryptionService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabasesProvider,
        {
          provide: EncryptionService,
          useFactory: mockEncryptionService,
        },
        {
          provide: getRepositoryToken(DatabaseInstanceEntity),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get(DatabasesProvider);
    repository = module.get(getRepositoryToken(DatabaseInstanceEntity));
    encryptionService = module.get(EncryptionService);

    encryptionService.decrypt.mockReturnValue(mockDataToEncrypt);
    encryptionService.encrypt.mockReturnValue(mockEncryptResult);
  });

  describe('exists', () => {
    it('Should return true if database exists', async () => {
      mockQueryBuilderGetOne.mockReturnValueOnce({ id: 'id ' });
      expect(await service.exists(mockStandaloneDatabaseEntity.id)).toEqual(true);
    });
    it('Should return false if database not found', async () => {
      mockQueryBuilderGetOne.mockReturnValueOnce(null);
      expect(await service.exists(mockStandaloneDatabaseEntity.id)).toEqual(false);
    });
  });

  describe('getAll', () => {
    it('Should return databases list with decrypted fields', async () => {
      mockQueryBuilderGetMany.mockReturnValueOnce([mockDatabaseEntity]);

      expect(await service.getAll()).toEqual([{
        ...mockDatabaseEntity,
        password: mockDataToEncrypt,
        sentinelMasterPassword: mockDataToEncrypt,
      }]);
    });
    it('Should return databases list even if decrypt fails', async () => {
      mockQueryBuilderGetMany.mockReturnValueOnce([mockDatabaseEntity]);
      encryptionService.decrypt.mockRejectedValue(new Error('some error'));

      expect(await service.getAll()).toEqual([{
        ...mockStandaloneDatabaseEntity,
        password: null,
        sentinelMasterPassword: null,
      }]);
    });
  });

  describe('getOneById', () => {
    it('Should return database with decrypted fields', async () => {
      mockQueryBuilderGetOne.mockReturnValueOnce(mockDatabaseEntity);

      expect(await service.getOneById(mockDatabaseEntity.id)).toEqual({
        ...mockDatabaseEntity,
        password: mockDataToEncrypt,
        sentinelMasterPassword: mockDataToEncrypt,
      });
    });
    it('Should return database even if decrypt fails', async () => {
      mockQueryBuilderGetOne.mockReturnValueOnce(mockDatabaseEntity);
      encryptionService.decrypt.mockRejectedValue(new Error('some error'));

      expect(await service.getOneById(mockDatabaseEntity.id, true)).toEqual({
        ...mockStandaloneDatabaseEntity,
        password: null,
        sentinelMasterPassword: null,
      });
    });
    it('Should throw an error when failed to decrypt', async () => {
      mockQueryBuilderGetOne.mockReturnValueOnce(mockDatabaseEntity);
      encryptionService.decrypt.mockRejectedValue(new KeytarUnavailableException());

      await expect(service.getOneById(mockDatabaseEntity.id)).rejects.toThrowError(KeytarUnavailableException);
    });
    it('Should throw an error when database not found', async () => {
      mockQueryBuilderGetOne.mockReturnValueOnce(null);

      await expect(service.getOneById(mockDatabaseEntity.id)).rejects.toThrowError(NotFoundException);
    });
  });

  describe('save', () => {
    it('Should save entity', async () => {
      repository.save.mockReturnValue(mockDatabaseEntity);
      encryptionService.decrypt.mockReturnValue(mockDatabaseEntity.password);

      expect(await service.save(mockDatabaseEntity)).toEqual(mockDatabaseEntity);
    });
    it('Should throw an error when encryption failed', async () => {
      repository.save.mockReturnValue(mockDatabaseEntity);
      encryptionService.encrypt.mockRejectedValue(new KeytarUnavailableException());

      await expect(service.save(mockDatabaseEntity)).rejects.toThrowError(KeytarUnavailableException);
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('Should update entity', async () => {
      repository.update.mockReturnValue(mockDatabaseEntity);

      expect(await service.update(mockDatabaseEntity.id, mockDatabaseEntity)).toEqual(mockDatabaseEntity);
    });
    it('Should throw an error when encryption failed', async () => {
      repository.update.mockReturnValue(mockDatabaseEntity);
      encryptionService.encrypt.mockRejectedValue(new KeytarUnavailableException());

      await expect(
        service.update(mockDatabaseEntity.id, mockDatabaseEntity),
      ).rejects.toThrowError(KeytarUnavailableException);
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe('patch', () => {
    it('Should update entity', async () => {
      repository.update.mockReturnValue(mockDatabaseEntity);

      expect(await service.patch(mockDatabaseEntity.id, { name: 'some' })).toEqual(mockDatabaseEntity);
    });
    it('Should throw an error if password defined', async () => {
      repository.update.mockReturnValue(mockDatabaseEntity);

      await expect(service.patch(mockDatabaseEntity.id, {
        name: 'some',
        password: 'some',
      })).rejects.toThrowError(BadRequestException);
      expect(repository.update).not.toHaveBeenCalled();
    });
    it('Should throw an error if password passed with null value', async () => {
      repository.update.mockReturnValue(mockDatabaseEntity);

      await expect(service.patch(mockDatabaseEntity.id, {
        name: 'some',
        password: null,
      })).rejects.toThrowError(BadRequestException);
      expect(repository.update).not.toHaveBeenCalled();
    });
    it('Should throw an error if sentinelMasterPassword defined', async () => {
      repository.update.mockReturnValue(mockDatabaseEntity);

      await expect(service.patch(mockDatabaseEntity.id, {
        name: 'some',
        sentinelMasterPassword: 'some',
      })).rejects.toThrowError(BadRequestException);
      expect(repository.update).not.toHaveBeenCalled();
    });
    it('Should throw an error if sentinelMasterPassword passed with null value', async () => {
      repository.update.mockReturnValue(mockDatabaseEntity);

      await expect(service.patch(mockDatabaseEntity.id, {
        name: 'some',
        sentinelMasterPassword: null,
      })).rejects.toThrowError(BadRequestException);
      expect(repository.update).not.toHaveBeenCalled();
    });
  });
});
