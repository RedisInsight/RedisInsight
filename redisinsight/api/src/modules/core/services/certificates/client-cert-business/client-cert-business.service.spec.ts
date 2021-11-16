import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import {
  mockClientCertDto,
  mockClientCertEntity,
  mockEncryptionService,
  mockEncryptResult,
  mockQueryBuilderGetMany,
  mockRepository,
  MockType,
} from 'src/__mocks__';
import { ClientCertificateEntity } from 'src/modules/core/models/client-certificate.entity';
import { EncryptionService } from 'src/modules/core/encryption/encryption.service';
import { KeytarEncryptionErrorException } from 'src/modules/core/encryption/exceptions';
import { ClientCertBusinessService } from './client-cert-business.service';

describe('ClientCertBusinessService', () => {
  let service: ClientCertBusinessService;
  let repository: MockType<Repository<ClientCertificateEntity>>;
  let encryptionService: MockType<EncryptionService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientCertBusinessService,
        {
          provide: EncryptionService,
          useFactory: mockEncryptionService,
        },
        {
          provide: getRepositoryToken(ClientCertificateEntity),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = await module.get<ClientCertBusinessService>(
      ClientCertBusinessService,
    );
    encryptionService = module.get(EncryptionService);
    repository = await module.get(getRepositoryToken(ClientCertificateEntity));
  });

  describe('getAll', () => {
    it('get all certificates from the repository', async () => {
      mockQueryBuilderGetMany.mockResolvedValueOnce([mockClientCertEntity]);

      const result = await service.getAll();

      expect(repository.createQueryBuilder).toHaveBeenCalled();
      expect(result).toEqual([mockClientCertEntity]);
    });
  });

  describe('getOneById', () => {
    it('successfully found the certificate', async () => {
      repository.findOne.mockResolvedValue(mockClientCertEntity);
      encryptionService.decrypt
        .mockResolvedValueOnce(mockClientCertEntity.certificate)
        .mockResolvedValueOnce(mockClientCertEntity.key);

      const result = await service.getOneById(mockClientCertEntity.id);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: mockClientCertEntity.id },
      });
      expect(result).toEqual(mockClientCertEntity);
    });
    it('certificate not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.getOneById(mockClientCertEntity.id)).rejects.toThrow(BadRequestException);
    });
    it('should find entity and return encrypted fields to equal empty string on decrypted error', async () => {
      repository.findOne.mockResolvedValue(mockClientCertEntity);
      encryptionService.decrypt
        .mockRejectedValueOnce(new Error('Decryption error'))
        .mockRejectedValueOnce(new Error('Decryption error'));

      const result = await service.getOneById(mockClientCertEntity.id);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: mockClientCertEntity.id },
      });
      expect(result).toEqual({
        ...mockClientCertEntity,
        certificate: '',
        key: '',
      });
    });
  });

  describe('create', () => {
    it('successfully create the certificate', async () => {
      repository.findOne.mockResolvedValue(null);
      repository.create.mockResolvedValueOnce(mockClientCertEntity);
      encryptionService.encrypt
        .mockResolvedValueOnce(mockEncryptResult)
        .mockResolvedValueOnce(mockEncryptResult);
      repository.save.mockResolvedValue(mockClientCertEntity);

      const result = await service.create(mockClientCertDto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { name: mockClientCertEntity.name },
      });
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(mockClientCertEntity);
    });
    it('certificate with this name exist', async () => {
      repository.findOne.mockResolvedValue(mockClientCertEntity);

      await expect(service.create(mockClientCertDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(repository.save).not.toHaveBeenCalled();
    });
    it('should throw an error when unable to encrypt the data', async () => {
      repository.findOne.mockResolvedValueOnce(null);
      repository.create.mockResolvedValueOnce(mockClientCertEntity);
      encryptionService.encrypt.mockRejectedValueOnce(new KeytarEncryptionErrorException());

      await expect(service.create(mockClientCertDto)).rejects.toThrow(
        KeytarEncryptionErrorException,
      );

      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('successfully delete the certificate', async () => {
      repository.findOne.mockResolvedValue(mockClientCertEntity);

      await service.delete(mockClientCertEntity.id);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: mockClientCertEntity.id },
      });
      expect(repository.delete).toHaveBeenCalledWith(mockClientCertEntity.id);
    });
    it('certificate not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.delete(mockClientCertEntity.id)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });
});
