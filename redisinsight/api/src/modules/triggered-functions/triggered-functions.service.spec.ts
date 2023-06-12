import { Test, TestingModule } from '@nestjs/testing';
import { plainToClass } from 'class-transformer';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import {
  mockClientMetadata,
  mockDatabaseConnectionService,
  mockIORedisClient,
  mockVerboseLibraryReply,
  mockSimpleLibraryReply,
  MockType,
} from 'src/__mocks__';
import { DatabaseConnectionService } from 'src/modules/database/database-connection.service';
import { TriggeredFunctionsService } from 'src/modules/triggered-functions/triggered-functions.service';
import { FunctionType, ShortFunction, Function } from './models';

const mockLibrariesReply = [
  mockSimpleLibraryReply,
  ['api_version', '1.0',
    'cluster_functions', [],
    'configuration', null,
    'engine', 'js',
    'functions', ['foo1'],
    'keyspace_triggers', [],
    'name', 'library2',
    'pending_jobs', 1,
    'stream_triggers', [],
    'user', 'default'],
];

const mockTFunctionsVerboseReply = [[
  'api_version', '1.0',
  'code', 'some code',
  'configuration', '{ name: "value" }',
  'functions', ['foo', 'bar'],
  'stream_triggers', ['stream_foo'],
  'keyspace_triggers', ['keyspace_foo'],
  'cluster_functions', ['cluster_foo'],
  'pending_jobs', 1,
  'name', 'library',
  'user', 'user',
]];

const mockLibraryName = 'name';

describe('TriggeredFunctionsService', () => {
  let service: TriggeredFunctionsService;
  let databaseConnectionService: MockType<DatabaseConnectionService>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TriggeredFunctionsService,
        {
          provide: DatabaseConnectionService,
          useFactory: mockDatabaseConnectionService,
        },
      ],
    }).compile();

    service = module.get(TriggeredFunctionsService);
    databaseConnectionService = module.get(DatabaseConnectionService);
  });

  describe('functionsList', () => {
    it('should return list of functions', async () => {
      mockIORedisClient.sendCommand.mockResolvedValueOnce([mockVerboseLibraryReply]);
      const list = await service.functionsList(mockClientMetadata);

      expect(list).toEqual([
        plainToClass(Function, {
          name: 'function',
          type: FunctionType.Function,
          description: 'description',
          flags: ['flag1'],
          isAsync: 1,
          library: 'libraryName',
        }),
        plainToClass(Function, {
          name: 'foo',
          type: FunctionType.ClusterFunction,
          library: 'libraryName',
        }),
        plainToClass(Function, {
          name: 'bar',
          type: FunctionType.ClusterFunction,
          library: 'libraryName',
        }),
        plainToClass(Function, {
          description: 'description',
          library: 'libraryName',
          name: 'stream',
          prefix: 'prefix',
          trim: 0,
          window: 1,
          type: FunctionType.StreamTrigger,
        }),
      ]);
    });

    it('Should throw Error when error during creating a client in functionsList', async () => {
      databaseConnectionService.createClient.mockRejectedValueOnce(new Error());
      await expect(service.functionsList(mockClientMetadata)).rejects.toThrow(Error);
    });

    it('should handle acl error NOPERM', async () => {
      try {
        mockIORedisClient.sendCommand.mockRejectedValueOnce(new Error('NOPERM'));
        await service.functionsList(mockClientMetadata);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(ForbiddenException);
      }
    });

    it('should handle HTTP error', async () => {
      try {
        mockIORedisClient.sendCommand.mockRejectedValueOnce(new NotFoundException('Not Found'));
        await service.functionsList(mockClientMetadata);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('details', () => {
    it('should return list of libraries', async () => {
      mockIORedisClient.sendCommand.mockResolvedValueOnce(mockTFunctionsVerboseReply);
      const library = await service.details(mockClientMetadata, mockLibraryName);

      expect(library).toEqual({
        name: 'library',
        user: 'user',
        pendingJobs: 1,
        apiVersion: '1.0',
        configuration: '{ name: "value" }',
        code: 'some code',
        functions: [
          plainToClass(ShortFunction, { name: 'foo', type: 'functions' }),
          plainToClass(ShortFunction, { name: 'bar', type: 'functions' }),
          plainToClass(ShortFunction, { name: 'cluster_foo', type: 'cluster_functions' }),
          plainToClass(ShortFunction, { name: 'keyspace_foo', type: 'keyspace_triggers' }),
          plainToClass(ShortFunction, { name: 'stream_foo', type: 'stream_triggers' }),
        ],
      });
    });

    it('Should throw Error when error during creating a client in details', async () => {
      databaseConnectionService.createClient.mockRejectedValueOnce(new Error());
      await expect(service.details(mockClientMetadata, mockLibraryName)).rejects.toThrow(Error);
    });

    it('should handle acl error', async () => {
      try {
        mockIORedisClient.sendCommand.mockRejectedValueOnce(new Error('NOPERM'));
        await service.details(mockClientMetadata, mockLibraryName);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(ForbiddenException);
      }
    });

    it('should handle HTTP error', async () => {
      try {
        mockIORedisClient.sendCommand.mockRejectedValueOnce(new NotFoundException('Not Found'));
        await service.details(mockClientMetadata, mockLibraryName);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('libraryList', () => {
    it('should return list of libraries', async () => {
      mockIORedisClient.sendCommand.mockResolvedValueOnce(mockLibrariesReply);
      const list = await service.libraryList(mockClientMetadata);

      expect(list).toEqual([
        {
          name: 'libraryName',
          user: 'default',
          pendingJobs: 0,
          totalFunctions: 4,
        },
        {
          name: 'library2',
          user: 'default',
          pendingJobs: 1,
          totalFunctions: 1,
        },
      ]);
    });

    it('Should throw Error when error during creating a client in libraryList', async () => {
      databaseConnectionService.createClient.mockRejectedValueOnce(new Error());
      await expect(service.libraryList(mockClientMetadata)).rejects.toThrow(Error);
    });

    it('should handle acl error', async () => {
      try {
        mockIORedisClient.sendCommand.mockRejectedValueOnce(new Error('NOPERM'));
        await service.libraryList(mockClientMetadata);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(ForbiddenException);
      }
    });

    it('should handle HTTP error', async () => {
      try {
        mockIORedisClient.sendCommand.mockRejectedValueOnce(new NotFoundException('Not Found'));
        await service.libraryList(mockClientMetadata);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });
  });
});
