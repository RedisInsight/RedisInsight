import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import {
  mockEncryptionService,
  mockEncryptResult,
  mockDatabase,
  MockType,
  mockBrowserHistory,
  mockBrowserHistoryPartial,
  mockBrowserHistoryRepository,
  mockBrowserHistoryModel,
} from 'src/__mocks__';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { BrowserHistoryProvider } from 'src/modules/browser/browser-history/providers/browser-history.provider';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { KeytarDecryptionErrorException } from 'src/modules/encryption/exceptions';
import { BrowserHistoryMode } from 'src/common/constants';
import { mockSessionMetadata } from 'src/__mocks__/common';
import { BrowserHistoryRepository } from '../repositories/browser-history.repository';

describe('BrowserHistoryProvider', () => {
  let service: BrowserHistoryProvider;
  let browserHistoryRepository: MockType<BrowserHistoryRepository>;
  let encryptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrowserHistoryProvider,
        {
          provide: EncryptionService,
          useFactory: mockEncryptionService,
        },
        {
          provide: BrowserHistoryRepository,
          useFactory: mockBrowserHistoryRepository,
        }
      ],
    }).compile();

    service = module.get<BrowserHistoryProvider>(BrowserHistoryProvider);
    browserHistoryRepository = module.get<BrowserHistoryRepository>(BrowserHistoryRepository) as MockType<BrowserHistoryRepository>;
    encryptionService = module.get<EncryptionService>(EncryptionService);

    // encryption mocks
    ['filter'].forEach((field) => {
      when(encryptionService.encrypt)
        .calledWith(JSON.stringify(mockBrowserHistory[field]))
        .mockReturnValue({
          ...mockEncryptResult,
          data: mockBrowserHistoryModel[field],
        });
      when(encryptionService.decrypt)
        .calledWith(mockBrowserHistoryModel[field], mockEncryptResult.encryption)
        .mockReturnValue(JSON.stringify(mockBrowserHistory[field]));
    });
  });

  describe('create', () => {
    it('should process new entity', async () => {
      browserHistoryRepository.save.mockReturnValueOnce(mockBrowserHistoryModel);
      expect(await service.create(mockSessionMetadata, mockBrowserHistoryPartial)).toEqual(mockBrowserHistory);
    });
  });

  describe('get', () => {
    it('should get browser history item', async () => {
      browserHistoryRepository.findById.mockReturnValueOnce(mockBrowserHistoryModel);
      expect(await service.get(mockSessionMetadata, mockBrowserHistory.id)).toEqual(mockBrowserHistory);
    });
    it('should return null fields in case of decryption errors', async () => {
      when(encryptionService.decrypt)
        .calledWith(mockBrowserHistoryModel['filter'], mockEncryptResult.encryption)
        .mockRejectedValueOnce(new KeytarDecryptionErrorException());
      browserHistoryRepository.findById.mockReturnValueOnce(mockBrowserHistoryModel);

      expect(await service.get(mockSessionMetadata, mockBrowserHistory.id)).toEqual({
        ...mockBrowserHistory,
        filter: null,
      });
    });
    it('should throw an error', async () => {
      browserHistoryRepository.findById.mockReturnValueOnce(null);

      try {
        await service.get(mockSessionMetadata, mockBrowserHistory.id);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.BROWSER_HISTORY_ITEM_NOT_FOUND);
      }
    });
  });

  describe('list', () => {
    it('should get list of browser history', async () => {
      browserHistoryRepository.getBrowserHistory.mockReturnValueOnce([{
        id: mockBrowserHistory.id,
        createdAt: mockBrowserHistory.createdAt,
        notExposed: 'field',
      }]);
      expect(await service.list(mockSessionMetadata, mockBrowserHistory.databaseId, BrowserHistoryMode.Pattern)).toEqual([{
        id: mockBrowserHistory.id,
        createdAt: mockBrowserHistory.createdAt,
        mode: mockBrowserHistory.mode,
      }]);
    });
  });

  describe('delete', () => {
    it('Should not return anything on cleanup', async () => {
      expect(await service.delete(mockSessionMetadata, mockBrowserHistory.databaseId, mockBrowserHistory.id)).toEqual(undefined);
      expect(browserHistoryRepository.delete).toBeCalledWith(mockSessionMetadata, mockBrowserHistory.id, mockBrowserHistory.databaseId);
    });
    it('Should throw InternalServerErrorException when error during delete', async () => {
      browserHistoryRepository.delete.mockRejectedValueOnce(new Error());
      await expect(service.delete(mockSessionMetadata, mockBrowserHistory.databaseId, mockBrowserHistory.id)).rejects.toThrowError(InternalServerErrorException);
      expect(browserHistoryRepository.delete).toBeCalledWith(mockSessionMetadata, mockBrowserHistory.id, mockBrowserHistory.databaseId);
    });
  });

  describe('cleanupDatabaseHistory', () => {
    it('Should not return anything on cleanup', async () => {
      expect(await service.cleanupDatabaseHistory(mockSessionMetadata, mockDatabase.id, BrowserHistoryMode.Pattern)).toEqual(undefined);
      expect(browserHistoryRepository.cleanupDatabaseHistory).toBeCalledWith(mockSessionMetadata, mockBrowserHistory.databaseId, mockBrowserHistory.mode);
    });
  });
});
