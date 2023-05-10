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
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BulkActionsAnalyticsService } from 'src/modules/bulk-actions/bulk-actions-analytics.service';
import * as fs from 'fs-extra';
import config from 'src/utils/config';
import { join } from 'path';

const PATH_CONFIG = config.get('dir_path');

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

const mockUploadImportFileByPathDto = {
  path: '/some/path',
};

jest.mock('fs-extra');
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('BulkImportService', () => {
  let service: BulkImportService;
  let databaseConnectionService: MockType<DatabaseConnectionService>;
  let analytics: MockType<BulkActionsAnalyticsService>;

  beforeEach(async () => {
    jest.mock('fs-extra', () => mockedFs);
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

  describe('uploadFromTutorial', () => {
    let spy;

    beforeEach(() => {
      spy = jest.spyOn(service as any, 'import');
      spy.mockResolvedValue(mockSummary);
      mockedFs.readFile.mockResolvedValue(Buffer.from('set foo bar'));
    });

    it('should import file by path', async () => {
      mockedFs.pathExists.mockImplementationOnce(async () => true);

      await service.uploadFromTutorial(mockClientMetadata, mockUploadImportFileByPathDto);

      expect(mockedFs.readFile).toHaveBeenCalledWith(join(PATH_CONFIG.homedir, mockUploadImportFileByPathDto.path));
    });

    it('should import file by path with static', async () => {
      mockedFs.pathExists.mockImplementationOnce(async () => true);

      await service.uploadFromTutorial(mockClientMetadata, { path: '/static/guides/_data.file' });

      expect(mockedFs.readFile).toHaveBeenCalledWith(join(PATH_CONFIG.homedir, '/guides/_data.file'));
    });

    it('should normalize path before importing and not search for file outside home folder', async () => {
      mockedFs.pathExists.mockImplementationOnce(async () => true);

      await service.uploadFromTutorial(mockClientMetadata, {
        path: '/../../../danger',
      });

      expect(mockedFs.readFile).toHaveBeenCalledWith(join(PATH_CONFIG.homedir, 'danger'));
    });

    it('should normalize path before importing and throw an error when search for file outside home folder (relative)', async () => {
      mockedFs.pathExists.mockImplementationOnce(async () => true);

      try {
        await service.uploadFromTutorial(mockClientMetadata, {
          path: '../../../danger',
        });

        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual('Data file was not found');
      }
    });

    it('should throw BadRequest when no file found', async () => {
      mockedFs.pathExists.mockImplementationOnce(async () => false);

      try {
        await service.uploadFromTutorial(mockClientMetadata, {
          path: '../../../danger',
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual('Data file was not found');
      }
    });

    it('should throw BadRequest when file size is greater then 100MB', async () => {
      mockedFs.pathExists.mockImplementationOnce(async () => true);
      mockedFs.stat.mockImplementationOnce(async () => ({ size: 100 * 1024 * 1024 + 1 } as fs.Stats));

      try {
        await service.uploadFromTutorial(mockClientMetadata, mockUploadImportFileByPathDto);

        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual('Maximum file size is 100MB');
      }
    });
  });
});
