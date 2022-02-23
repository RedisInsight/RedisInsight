import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  mockDataToEncrypt,
  mockEncryptionService,
  mockEncryptResult,
  mockRepository,
  MockType,
} from 'src/__mocks__';
import { EncryptionService } from 'src/modules/core/encryption/encryption.service';
import { DatabaseInstanceEntity } from 'src/modules/core/models/database-instance.entity';
import { StackDatabasesProvider } from './stack.databases.provider';

describe('StackDatabasesProvider', () => {
  let service: StackDatabasesProvider;
  let encryptionService: MockType<EncryptionService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StackDatabasesProvider,
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

    service = module.get(StackDatabasesProvider);
    encryptionService = module.get(EncryptionService);

    encryptionService.decrypt.mockReturnValue(mockDataToEncrypt);
    encryptionService.encrypt.mockReturnValue(mockEncryptResult);
  });

  describe('onApplicationBootstrap', () => {
    beforeEach(() => {
      service.save = jest.fn();
    });
    it('should save database if it is not exist', async () => {
      service.exists = jest.fn().mockResolvedValue(false);

      await service.onApplicationBootstrap();

      expect(service.save).toHaveBeenCalled();
    });
    it('should not save database if it is exist', async () => {
      service.exists = jest.fn().mockResolvedValue(true);

      await service.onApplicationBootstrap();

      expect(service.save).not.toHaveBeenCalled();
    });
  });
});
