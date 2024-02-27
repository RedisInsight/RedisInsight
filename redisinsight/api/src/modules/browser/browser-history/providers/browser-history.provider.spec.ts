import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import {
  mockEncryptionService,
  mockEncryptResult,
  mockRepository,
  mockDatabase,
  MockType,
  mockQueryBuilderGetMany,
  mockQueryBuilderGetManyRaw,
  mockBrowserHistory,
  mockBrowserHistoryEntity,
  mockBrowserHistoryPartial,
} from 'src/__mocks__';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { BrowserHistoryProvider } from 'src/modules/browser/browser-history/providers/browser-history.provider';
import { BrowserHistoryEntity } from 'src/modules/browser/browser-history/entities/browser-history.entity';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { KeytarDecryptionErrorException } from 'src/modules/encryption/exceptions';
import { BrowserHistory } from 'src/modules/browser/browser-history/dto';
import { BrowserHistoryMode } from 'src/common/constants';

describe('BrowserHistoryProvider', () => {
  let service: BrowserHistoryProvider;
  let repository: MockType<Repository<BrowserHistory>>;
  let encryptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrowserHistoryProvider,
        {
          provide: getRepositoryToken(BrowserHistoryEntity),
          useFactory: mockRepository,
        },
        {
          provide: EncryptionService,
          useFactory: mockEncryptionService,
        },
      ],
    }).compile();

    service = module.get<BrowserHistoryProvider>(BrowserHistoryProvider);
    repository = module.get(getRepositoryToken(BrowserHistoryEntity));
    encryptionService = module.get<EncryptionService>(EncryptionService);

    // encryption mocks
    ['filter'].forEach((field) => {
      when(encryptionService.encrypt)
        .calledWith(JSON.stringify(mockBrowserHistory[field]))
        .mockReturnValue({
          ...mockEncryptResult,
          data: mockBrowserHistoryEntity[field],
        });
      when(encryptionService.decrypt)
        .calledWith(mockBrowserHistoryEntity[field], mockEncryptResult.encryption)
        .mockReturnValue(JSON.stringify(mockBrowserHistory[field]));
    });
  });

  describe('create', () => {
    it('should process new entity', async () => {
      repository.save.mockReturnValueOnce(mockBrowserHistoryEntity);
      expect(await service.create(mockBrowserHistoryPartial)).toEqual(mockBrowserHistory);
    });
  });

  describe('get', () => {
    it('should get browser history item', async () => {
      repository.findOneBy.mockReturnValueOnce(mockBrowserHistoryEntity);

      expect(await service.get(mockBrowserHistory.id)).toEqual(mockBrowserHistory);
    });
    it('should return null fields in case of decryption errors', async () => {
      when(encryptionService.decrypt)
        .calledWith(mockBrowserHistoryEntity['filter'], mockEncryptResult.encryption)
        .mockRejectedValueOnce(new KeytarDecryptionErrorException());
      repository.findOneBy.mockReturnValueOnce(mockBrowserHistoryEntity);

      expect(await service.get(mockBrowserHistory.id)).toEqual({
        ...mockBrowserHistory,
        filter: null,
      });
    });
    it('should throw an error', async () => {
      repository.findOneBy.mockReturnValueOnce(null);

      try {
        await service.get(mockBrowserHistory.id);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.BROWSER_HISTORY_ITEM_NOT_FOUND);
      }
    });
  });

  describe('list', () => {
    it('should get list of browser history', async () => {
      mockQueryBuilderGetMany.mockReturnValueOnce([{
        id: mockBrowserHistory.id,
        createdAt: mockBrowserHistory.createdAt,
        notExposed: 'field',
      }]);
      expect(await service.list(mockBrowserHistory.databaseId, BrowserHistoryMode.Pattern)).toEqual([{
        id: mockBrowserHistory.id,
        createdAt: mockBrowserHistory.createdAt,
        mode: mockBrowserHistory.mode,
      }]);
    });
  });

  describe('delete', () => {
    it('Should not return anything on cleanup', async () => {
      repository.delete.mockReturnValueOnce(mockBrowserHistoryEntity);
      expect(await service.delete(mockBrowserHistory.databaseId, mockBrowserHistory.id)).toEqual(undefined);
    });
    it('Should throw InternalServerErrorException when error during delete', async () => {
      repository.delete.mockRejectedValueOnce(new Error());
      await expect(service.delete(mockBrowserHistory.databaseId, mockBrowserHistory.id)).rejects.toThrowError(InternalServerErrorException);
    });
  });

  describe('cleanupDatabaseHistory', () => {
    it('Should not return anything on cleanup', async () => {
      mockQueryBuilderGetManyRaw.mockReturnValue([
        { id: mockBrowserHistoryEntity.id },
        { id: mockBrowserHistoryEntity.id },
      ]);

      expect(await service.cleanupDatabaseHistory(mockDatabase.id, BrowserHistoryMode.Pattern)).toEqual(undefined);
    });
  });
});
