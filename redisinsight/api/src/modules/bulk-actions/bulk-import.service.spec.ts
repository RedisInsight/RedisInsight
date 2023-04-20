import { Test, TestingModule } from '@nestjs/testing';
import { BulkImportService } from 'src/modules/bulk-actions/bulk-import.service';
import { DatabaseConnectionService } from 'src/modules/database/database-connection.service';
import {
  mockClientMetadata,
  mockDatabaseConnectionService,
  mockIORedisClient,
  mockIORedisCluster, MockType,
} from 'src/__mocks__';
import { MemoryStoredFile } from 'nestjs-form-data';
import { BulkActionSummary } from 'src/modules/bulk-actions/models/bulk-action-summary';
import { IBulkActionOverview } from 'src/modules/bulk-actions/interfaces/bulk-action-overview.interface';
import { BulkActionStatus, BulkActionType } from 'src/modules/bulk-actions/constants';
import { NotFoundException } from '@nestjs/common';
import { BulkActionsAnalyticsService } from 'src/modules/bulk-actions/bulk-actions-analytics.service';

const generateNCommandsBuffer = (n: number) => Buffer.from(
  (new Array(n)).fill(1).map(() => ['set', ['foo', 'bar']]).join('\n'),
);
const generateNBatchCommands = (n: number) => (new Array(n)).fill(1).map(() => ['set', ['foo', 'bar']]);
const generateNBatchCommandsResults = (n: number) => (new Array(n)).fill(1).map(() => [null, 'OK']);
const mockBatchCommands = generateNBatchCommands(100);
const mockBatchCommandsResult = generateNBatchCommandsResults(100);
const mockBatchCommandsResultWithErrors = [...(new Array(99)).fill(1).map(() => [null, 'OK']), ['ReplyError']];
const mockSummary: BulkActionSummary = Object.assign(new BulkActionSummary(), {
  processed: 100,
  succeed: 100,
  failed: 0,
  errors: [],
});

const mockSummaryWithErrors = Object.assign(new BulkActionSummary(), {
  processed: 100,
  succeed: 99,
  failed: 1,
  errors: [],
});

const mockImportResult: IBulkActionOverview = {
  id: 'empty',
  databaseId: mockClientMetadata.databaseId,
  type: BulkActionType.Import,
  summary: mockSummary.getOverview(),
  progress: null,
  filter: null,
  status: BulkActionStatus.Completed,
  duration: 100,
};

const mockUploadImportFileDto = {
  file: {
    originalname: 'filename',
    size: 1,
    buffer: Buffer.from('SET foo bar'),
  } as unknown as MemoryStoredFile,
};

describe('BulkImportService', () => {
  let service: BulkImportService;
  let databaseConnectionService: MockType<DatabaseConnectionService>;
  let analytics: MockType<BulkActionsAnalyticsService>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BulkImportService,
        {
          provide: DatabaseConnectionService,
          useFactory: mockDatabaseConnectionService,
        },
        {
          provide: BulkActionsAnalyticsService,
          useFactory: () => ({
            sendActionStarted: jest.fn(),
            sendActionStopped: jest.fn(),
          }),
        },
      ],
    }).compile();

    service = module.get(BulkImportService);
    databaseConnectionService = module.get(DatabaseConnectionService);
    analytics = module.get(BulkActionsAnalyticsService);
  });

  describe('executeBatch', () => {
    it('should execute batch in pipeline for standalone', async () => {
      mockIORedisClient.exec.mockResolvedValueOnce(mockBatchCommandsResult);
      expect(await service['executeBatch'](mockIORedisClient, mockBatchCommands)).toEqual(mockSummary);
    });
    it('should execute batch in pipeline for standalone with errors', async () => {
      mockIORedisClient.exec.mockResolvedValueOnce(mockBatchCommandsResultWithErrors);
      expect(await service['executeBatch'](mockIORedisClient, mockBatchCommands)).toEqual(mockSummaryWithErrors);
    });
    it('should return all failed in case of global error', async () => {
      mockIORedisClient.exec.mockRejectedValueOnce(new Error());
      expect(await service['executeBatch'](mockIORedisClient, mockBatchCommands)).toEqual({
        ...mockSummary.getOverview(),
        succeed: 0,
        failed: mockSummary.getOverview().processed,
      });
    });
    it('should execute batch of commands without pipeline for cluster', async () => {
      mockIORedisCluster.call.mockRejectedValueOnce(new Error());
      mockIORedisCluster.call.mockResolvedValue('OK');
      expect(await service['executeBatch'](mockIORedisCluster, mockBatchCommands)).toEqual(mockSummaryWithErrors);
    });
  });

  describe('import', () => {
    let spy;

    beforeEach(() => {
      spy = jest.spyOn(service as any, 'executeBatch');
    });

    it('should import data', async () => {
      spy.mockResolvedValue(mockSummary);
      expect(await service.import(mockClientMetadata, mockUploadImportFileDto)).toEqual({
        ...mockImportResult,
        duration: jasmine.anything(),
      });
      expect(analytics.sendActionStopped).toHaveBeenCalledWith({
        ...mockImportResult,
        duration: jasmine.anything(),
      });
    });

    it('should import data (100K) from file in batches 10K each', async () => {
      spy.mockResolvedValue(Object.assign(new BulkActionSummary(), {
        processed: 10_000,
        succeed: 10_000,
        failed: 0,
      }));
      expect(await service.import(mockClientMetadata, {
        file: {
          ...mockUploadImportFileDto.file,
          buffer: generateNCommandsBuffer(100_000),
        } as unknown as MemoryStoredFile,
      })).toEqual({
        ...mockImportResult,
        summary: {
          processed: 100_000,
          succeed: 100_000,
          failed: 0,
          errors: [],
        },
        duration: jasmine.anything(),
      });
    });

    it('should import data (10K) from file in batches 10K each', async () => {
      spy.mockResolvedValue(Object.assign(new BulkActionSummary(), {
        processed: 10_000,
        succeed: 10_000,
        failed: 0,
      }));
      expect(await service.import(mockClientMetadata, {
        file: {
          ...mockUploadImportFileDto.file,
          buffer: generateNCommandsBuffer(10_000),
        } as unknown as MemoryStoredFile,
      })).toEqual({
        ...mockImportResult,
        summary: {
          processed: 10_000,
          succeed: 10_000,
          failed: 0,
          errors: [],
        },
        duration: jasmine.anything(),
      });
    });

    it('should not import any data due to parse error', async () => {
      spy.mockResolvedValue(Object.assign(new BulkActionSummary(), {
        processed: 0,
        succeed: 0,
        failed: 0,
      }));
      expect(await service.import(mockClientMetadata, {
        file: {
          ...mockUploadImportFileDto.file,
          buffer: Buffer.from('{"incorrectdata"}\n{"incorrectdata"}'),
        } as unknown as MemoryStoredFile,
      })).toEqual({
        ...mockImportResult,
        summary: {
          processed: 2,
          succeed: 0,
          failed: 2,
          errors: [],
        },
        duration: jasmine.anything(),
      });
      expect(mockIORedisClient.disconnect).toHaveBeenCalled();
    });

    it('should throw an error in case of global error', async () => {
      try {
        databaseConnectionService.createClient.mockRejectedValueOnce(new NotFoundException());

        await service.import(mockClientMetadata, mockUploadImportFileDto);

        fail();
      } catch (e) {
        expect(mockIORedisClient.disconnect).not.toHaveBeenCalled();
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });
  });
});
