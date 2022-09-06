import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CaCertificateEntity } from 'src/modules/core/models/ca-certificate.entity';
import {
  mockCaCertDto,
  mockCaCertEntity,
  mockEncryptionService,
  mockEncryptResult,
  mockQueryBuilderGetMany,
  mockRepository,
  MockType,
} from 'src/__mocks__';
import { EncryptionService } from 'src/modules/core/encryption/encryption.service';
import { KeytarEncryptionErrorException } from 'src/modules/core/encryption/exceptions';
import { CaCertBusinessService } from './ca-cert-business.service';

describe('CaCertBusinessService', () => {
  let service: CaCertBusinessService;
  let repository: MockType<Repository<CaCertificateEntity>>;
  let encryptionService: MockType<EncryptionService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CaCertBusinessService,
        {
          provide: EncryptionService,
          useFactory: mockEncryptionService,
        },
        {
          provide: getRepositoryToken(CaCertificateEntity),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = await module.get<CaCertBusinessService>(CaCertBusinessService);
    encryptionService = module.get(EncryptionService);
    repository = await module.get(getRepositoryToken(CaCertificateEntity));
  });

  describe('getAll', () => {
    it('get all certificates from the repository', async () => {
      mockQueryBuilderGetMany.mockResolvedValueOnce([mockCaCertEntity]);

      const result = await service.getAll();

      expect(repository.createQueryBuilder).toHaveBeenCalled();
      expect(result).toEqual([mockCaCertEntity]);
    });
  });

  describe('getOneById', () => {
    it('should successfully find entity and decrypt field', async () => {
      repository.findOneBy.mockResolvedValue(mockCaCertEntity);
      encryptionService.decrypt.mockResolvedValueOnce(mockCaCertEntity.certificate);

      const result = await service.getOneById(mockCaCertEntity.id);

      expect(repository.findOneBy).toHaveBeenCalledWith({
        id: mockCaCertEntity.id,
      });
      expect(result).toEqual(mockCaCertEntity);
    });
    it('should throw an error when certificate not found', async () => {
      repository.findOneBy.mockResolvedValue(null);

      // todo: refactor. why BadRequest?
      await expect(service.getOneById(mockCaCertEntity.id)).rejects.toThrow(
        BadRequestException,
      );
    });
    it('should find entity and return encrypted fields to equal empty string on decrypted error', async () => {
      repository.findOneBy.mockResolvedValue(mockCaCertEntity);
      encryptionService.decrypt.mockRejectedValueOnce(new Error('Decryption error'));

      const result = await service.getOneById(mockCaCertEntity.id);

      expect(repository.findOneBy).toHaveBeenCalledWith({
        id: mockCaCertEntity.id,
      });
      expect(result).toEqual({
        ...mockCaCertEntity,
        certificate: '',
      });
    });
  });

  describe('create', () => {
    it('successfully create the certificate', async () => {
      repository.findOneBy.mockResolvedValue(null);
      repository.create.mockResolvedValueOnce(mockCaCertEntity);
      encryptionService.encrypt.mockResolvedValueOnce(mockEncryptResult);
      repository.save.mockResolvedValue(mockCaCertEntity);

      const result = await service.create(mockCaCertDto);

      expect(repository.findOneBy).toHaveBeenCalledWith({
        name: mockCaCertEntity.name,
      });
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(mockCaCertEntity);
    });
    it('certificate with this name exist', async () => {
      repository.findOneBy.mockResolvedValue(mockCaCertEntity);

      await expect(service.create(mockCaCertDto)).rejects.toThrow(
        BadRequestException,
      );

      expect(repository.save).not.toHaveBeenCalled();
    });
    it('should throw and error when unable to encrypt the data', async () => {
      repository.findOneBy.mockResolvedValueOnce(null);
      repository.create.mockResolvedValueOnce(mockCaCertEntity);
      encryptionService.encrypt.mockRejectedValueOnce(new KeytarEncryptionErrorException());

      await expect(service.create(mockCaCertDto)).rejects.toThrow(
        KeytarEncryptionErrorException,
      );

      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('successfully delete the certificate', async () => {
      repository.findOneBy.mockResolvedValue(mockCaCertEntity);

      await service.delete(mockCaCertEntity.id);

      expect(repository.findOneBy).toHaveBeenCalledWith({
        id: mockCaCertEntity.id,
      });
      expect(repository.delete).toHaveBeenCalledWith(mockCaCertEntity.id);
    });
    it('certificate not found', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.delete(mockCaCertEntity.id)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });
});
