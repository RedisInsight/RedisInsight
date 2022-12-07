import { pick } from 'lodash';
import { DatabaseImportService } from 'src/modules/database-import/database-import.service';
import {
  mockDatabase,
  mockDatabaseImportAnalytics,
  mockDatabaseImportFile,
  mockDatabaseImportResponse,
  MockType,
} from 'src/__mocks__';
import { DatabaseRepository } from 'src/modules/database/repositories/database.repository';
import { DatabaseImportAnalytics } from 'src/modules/database-import/database-import.analytics';
import { Test, TestingModule } from '@nestjs/testing';
import { ConnectionType } from 'src/modules/database/entities/database.entity';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import {
  NoDatabaseImportFileProvidedException, SizeLimitExceededDatabaseImportFileException,
  UnableToParseDatabaseImportFileException,
} from 'src/modules/database-import/exceptions';

describe('DatabaseImportService', () => {
  let service: DatabaseImportService;
  let databaseRepository: MockType<DatabaseRepository>;
  let analytics: MockType<DatabaseImportAnalytics>;
  let validatoSpy;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseImportService,
        {
          provide: DatabaseRepository,
          useFactory: jest.fn(() => ({
            create: jest.fn().mockResolvedValue(mockDatabase),
          })),
        },
        {
          provide: DatabaseImportAnalytics,
          useFactory: mockDatabaseImportAnalytics,
        },
      ],
    }).compile();

    service = await module.get(DatabaseImportService);
    databaseRepository = await module.get(DatabaseRepository);
    analytics = await module.get(DatabaseImportAnalytics);
    validatoSpy = jest.spyOn(service['validator'], 'validateOrReject');
  });

  describe('importDatabase', () => {
    beforeEach(() => {
      databaseRepository.create.mockRejectedValueOnce(new BadRequestException());
      databaseRepository.create.mockRejectedValueOnce(new ForbiddenException());
      validatoSpy.mockRejectedValueOnce([new ValidationError()]);
    });

    it('should import databases from json', async () => {
      const response = await service.import(mockDatabaseImportFile);

      expect(response).toEqual({
        ...mockDatabaseImportResponse,
        errors: undefined, // errors omitted from response
      });
      expect(analytics.sendImportResults).toHaveBeenCalledWith(mockDatabaseImportResponse);
    });

    it('should import databases from base64', async () => {
      const response = await service.import({
        ...mockDatabaseImportFile,
        mimetype: 'binary/octet-stream',
        buffer: Buffer.from(mockDatabaseImportFile.buffer.toString('base64')),
      });

      expect(response).toEqual({
        ...mockDatabaseImportResponse,
        errors: undefined, // errors omitted from response
      });
      expect(analytics.sendImportResults).toHaveBeenCalledWith(mockDatabaseImportResponse);
    });

    it('should fail due to file was not provided', async () => {
      try {
        await service.import(undefined);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NoDatabaseImportFileProvidedException);
        expect(e.message).toEqual('No import file provided');
        expect(analytics.sendImportFailed)
          .toHaveBeenCalledWith(new NoDatabaseImportFileProvidedException('No import file provided'));
      }
    });

    it('should fail due to file exceeded size limitations', async () => {
      try {
        await service.import({
          ...mockDatabaseImportFile,
          size: 10 * 1024 * 1024 + 1,
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(SizeLimitExceededDatabaseImportFileException);
        expect(e.message).toEqual('Import file is too big. Maximum 10mb allowed');
      }
    });

    it('should fail due to incorrect json', async () => {
      try {
        await service.import({
          ...mockDatabaseImportFile,
          buffer: Buffer.from([0, 21]),
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(UnableToParseDatabaseImportFileException);
        expect(e.message).toEqual(`Unable to parse ${mockDatabaseImportFile.originalname}`);
      }
    });

    it('should fail due to incorrect base64 + truncate filename', async () => {
      try {
        await service.import({
          ...mockDatabaseImportFile,
          originalname: (new Array(1_000).fill(1)).join(''),
          mimetype: 'binary/octet-stream',
          buffer: Buffer.from([0, 21]),
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(UnableToParseDatabaseImportFileException);
        expect(e.message).toEqual(`Unable to parse ${(new Array(50).fill(1)).join('')}...`);
      }
    });
  });

  describe('createDatabase', () => {
    it('should create standalone database', async () => {
      await service['createDatabase']({
        ...mockDatabase,
      });

      expect(databaseRepository.create).toHaveBeenCalledWith({
        ...pick(mockDatabase, ['host', 'port', 'name', 'connectionType']),
        new: true,
      });
    });
    it('should create standalone with created name', async () => {
      await service['createDatabase']({
        ...mockDatabase,
        name: undefined,
      });

      expect(databaseRepository.create).toHaveBeenCalledWith({
        ...pick(mockDatabase, ['host', 'port', 'name', 'connectionType']),
        name: `${mockDatabase.host}:${mockDatabase.port}`,
        new: true,
      });
    });
    it('should create cluster database', async () => {
      await service['createDatabase']({
        ...mockDatabase,
        cluster: true,
      });

      expect(databaseRepository.create).toHaveBeenCalledWith({
        ...pick(mockDatabase, ['host', 'port', 'name']),
        connectionType: ConnectionType.CLUSTER,
        new: true,
      });
    });
  });
});
