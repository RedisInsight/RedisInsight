import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  mockDatabase,
  MockType,
  mockDatabaseId,
  mockBrowserHistoryProvider,
  mockBrowserHistoryEntity,
  mockBrowserHistory,
  mockClientMetadata,
} from 'src/__mocks__';
import { BrowserHistoryProvider } from 'src/modules/browser/browser-history/providers/browser-history.provider';
import { BrowserHistoryMode } from 'src/common/constants';
import { BrowserHistoryService } from 'src/modules/browser/browser-history/browser-history.service';

describe('BrowserHistoryService', () => {
  let service: BrowserHistoryService;
  let browserHistoryProvider: MockType<BrowserHistoryProvider>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrowserHistoryService,
        {
          provide: BrowserHistoryProvider,
          useFactory: mockBrowserHistoryProvider,
        },
      ],
    }).compile();

    service = await module.get(BrowserHistoryService);
    browserHistoryProvider = await module.get(BrowserHistoryProvider);
  });

  describe('create', () => {
    it('should create new database and send analytics event', async () => {
      browserHistoryProvider.create.mockResolvedValue(mockBrowserHistory);
      expect(await service.create(mockClientMetadata, mockBrowserHistory)).toEqual(mockBrowserHistory);
    });
    it('should throw NotFound if no browser history?', async () => {
      browserHistoryProvider.create.mockRejectedValueOnce(new Error());
      await expect(service.create(mockClientMetadata, mockBrowserHistory))
        .rejects.toThrow(new Error());
    });
  });

  describe('get', () => {
    it('should return browser history by id', async () => {
      browserHistoryProvider.get.mockResolvedValue(mockBrowserHistoryEntity);
      expect(await service.get(mockDatabase.id)).toEqual(mockBrowserHistoryEntity);
    });
  });

  describe('list', () => {
    it('should return browser history items', async () => {
      browserHistoryProvider.list.mockResolvedValue([mockBrowserHistory, mockBrowserHistory]);
      expect(await service.list(mockDatabaseId, BrowserHistoryMode.Pattern))
        .toEqual([mockBrowserHistory, mockBrowserHistory]);
    });
    it('should throw Error?', async () => {
      browserHistoryProvider.list.mockRejectedValueOnce(new Error());
      await expect(service.list(mockDatabaseId, BrowserHistoryMode.Pattern)).rejects.toThrow(Error);
    });
  });

  describe('delete', () => {
    it('should remove existing browser history item', async () => {
      browserHistoryProvider.delete.mockResolvedValue(mockBrowserHistory);
      expect(await service.delete(mockBrowserHistory.databaseId, BrowserHistoryMode.Pattern))
        .toEqual(mockBrowserHistory);
    });
    it('should throw NotFoundException? on any error during deletion', async () => {
      browserHistoryProvider.delete.mockRejectedValueOnce(new NotFoundException());
      await expect(service.delete(mockBrowserHistory.databaseId, BrowserHistoryMode.Pattern))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('bulkDelete', () => {
    it('should remove multiple browser history items', async () => {
      expect(await service.bulkDelete(mockBrowserHistory.databaseId, [mockDatabase.id]))
        .toEqual({ affected: 1 });
    });
    it('should ignore errors and do not count affected', async () => {
      browserHistoryProvider.delete.mockRejectedValueOnce(new NotFoundException());
      expect(await service.bulkDelete(mockBrowserHistory.databaseId, [mockDatabase.id]))
        .toEqual({ affected: 0 });
    });
  });
});
