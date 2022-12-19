import { when } from 'jest-when';
import { pick } from 'lodash';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  mockClientCertificate,
  mockClientCertificateCertificateEncrypted,
  mockClientCertificateCertificatePlain,
  mockClientCertificateEntity,
  mockClientCertificateId,
  mockClientCertificateKeyEncrypted,
  mockClientCertificateKeyPlain,
  mockEncryptionService,
  mockRepository,
  MockType,
} from 'src/__mocks__';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import {
  LocalClientCertificateRepository,
} from 'src/modules/certificate/repositories/local.client-certificate.repository';
import { ClientCertificateEntity } from 'src/modules/certificate/entities/client-certificate.entity';

describe('LocalClientCertificateRepository', () => {
  let service: LocalClientCertificateRepository;
  let encryptionService: MockType<EncryptionService>;
  let repository: MockType<Repository<ClientCertificateEntity>>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalClientCertificateRepository,
        {
          provide: getRepositoryToken(ClientCertificateEntity),
          useFactory: mockRepository,
        },
        {
          provide: EncryptionService,
          useFactory: mockEncryptionService,
        },
      ],
    }).compile();

    repository = await module.get(getRepositoryToken(ClientCertificateEntity));
    encryptionService = await module.get(EncryptionService);
    service = await module.get(LocalClientCertificateRepository);

    repository.findOneBy.mockResolvedValue(mockClientCertificateEntity);
    repository.createQueryBuilder().getMany.mockResolvedValue([
      pick(mockClientCertificateEntity, 'id', 'name'),
      pick(mockClientCertificateEntity, 'id', 'name'),
    ]);
    repository.save.mockResolvedValue(mockClientCertificateEntity);
    repository.create.mockReturnValue(mockClientCertificate); // not an entity since create happens before encryption

    when(encryptionService.decrypt)
      .calledWith(mockClientCertificateCertificateEncrypted, jasmine.anything())
      .mockResolvedValue(mockClientCertificateCertificatePlain)
      .calledWith(mockClientCertificateKeyEncrypted, jasmine.anything())
      .mockResolvedValue(mockClientCertificateKeyPlain);
    when(encryptionService.encrypt)
      .calledWith(mockClientCertificateCertificatePlain)
      .mockResolvedValue({
        data: mockClientCertificateCertificateEncrypted,
        encryption: mockClientCertificateEntity.encryption,
      })
      .calledWith(mockClientCertificateKeyPlain)
      .mockResolvedValue({
        data: mockClientCertificateKeyEncrypted,
        encryption: mockClientCertificateEntity.encryption,
      });
  });

  describe('get', () => {
    it('should return client certificate model', async () => {
      const result = await service.get(mockClientCertificateId);

      expect(result).toEqual(mockClientCertificate);
    });
  });

  describe('list', () => {
    it('should return client certificates list', async () => {
      const result = await service.list();

      expect(result).toEqual([
        pick(mockClientCertificate, 'id', 'name'),
        pick(mockClientCertificate, 'id', 'name'),
      ]);
    });
  });

  describe('create', () => {
    it('should create client certificate', async () => {
      repository.findOneBy.mockResolvedValueOnce(null);

      const result = await service.create(mockClientCertificate);

      expect(result).toEqual(mockClientCertificate);
    });

    it('should throw an error when client certificate with such name already exists', async () => {
      try {
        await service.create(mockClientCertificate);
        fail();
      } catch (e) {
        // todo: why not ConflictException?
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual(ERROR_MESSAGES.CLIENT_CERT_EXIST);
        expect(repository.save).not.toHaveBeenCalled();
      }
    });
  });

  describe('delete', () => {
    it('should delete client certificate', async () => {
      const result = await service.delete(mockClientCertificate.id);

      expect(result).toEqual(undefined);
    });

    it('should throw an error when trying to delete non-existing client certificate', async () => {
      repository.findOneBy.mockResolvedValueOnce(null);

      try {
        await service.delete(mockClientCertificate.id);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        // todo: why such message?
        expect(e.message).toEqual('Not Found');
        expect(repository.delete).not.toHaveBeenCalled();
      }
    });
  });
});
