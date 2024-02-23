import { Test, TestingModule } from '@nestjs/testing';
import { plainToClass } from 'class-transformer';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import {
  mockClientMetadata,
  mockVerboseLibraryReply,
  mockSimpleLibraryReply,
  MockType,
  mockDatabaseClientFactory,
  mockStandaloneRedisClient,
  mockClusterRedisClient,
} from 'src/__mocks__';
import { TriggeredFunctionsService } from 'src/modules/triggered-functions/triggered-functions.service';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
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

const mockCode = '#!js api_version=1.0 name=lib';

const mockConfig = '{}';

describe('TriggeredFunctionsService', () => {
  const standaloneClient = mockStandaloneRedisClient;
  const clusterClient = mockClusterRedisClient;
  const clusterNode1 = standaloneClient;
  const clusterNode2 = standaloneClient;
  let service: TriggeredFunctionsService;
  let databaseClientFactory: MockType<DatabaseClientFactory>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TriggeredFunctionsService,
        {
          provide: DatabaseClientFactory,
          useFactory: mockDatabaseClientFactory,
        },
      ],
    }).compile();

    service = module.get(TriggeredFunctionsService);
    databaseClientFactory = module.get(DatabaseClientFactory);
  });

  describe('functionsList', () => {
    it('should return list of functions', async () => {
      standaloneClient.sendCommand.mockResolvedValueOnce([mockVerboseLibraryReply]);
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
      databaseClientFactory.createClient.mockRejectedValueOnce(new Error());
      await expect(service.functionsList(mockClientMetadata)).rejects.toThrow(Error);
    });

    it('should handle acl error NOPERM', async () => {
      try {
        standaloneClient.sendCommand.mockRejectedValueOnce(new Error('NOPERM'));
        await service.functionsList(mockClientMetadata);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(ForbiddenException);
      }
    });

    it('should handle HTTP error', async () => {
      try {
        standaloneClient.sendCommand.mockRejectedValueOnce(new NotFoundException('Not Found'));
        await service.functionsList(mockClientMetadata);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('details', () => {
    it('should return list of libraries', async () => {
      standaloneClient.sendCommand.mockResolvedValueOnce(mockTFunctionsVerboseReply);
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
      databaseClientFactory.createClient.mockRejectedValueOnce(new Error());
      await expect(service.details(mockClientMetadata, mockLibraryName)).rejects.toThrow(Error);
    });

    it('should handle acl error', async () => {
      try {
        standaloneClient.sendCommand.mockRejectedValueOnce(new Error('NOPERM'));
        await service.details(mockClientMetadata, mockLibraryName);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(ForbiddenException);
      }
    });

    it('should handle HTTP error', async () => {
      try {
        standaloneClient.sendCommand.mockRejectedValueOnce(new NotFoundException('Not Found'));
        await service.details(mockClientMetadata, mockLibraryName);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });

    it('should return NotFoundException when library does not exist', async () => {
      standaloneClient.sendCommand.mockResolvedValueOnce([]);

      await expect(
        service.details(mockClientMetadata, mockLibraryName),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('libraryList', () => {
    it('should return list of libraries', async () => {
      standaloneClient.sendCommand.mockResolvedValueOnce(mockLibrariesReply);
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
      databaseClientFactory.createClient.mockRejectedValueOnce(new Error());
      await expect(service.libraryList(mockClientMetadata)).rejects.toThrow(Error);
    });

    it('should handle acl error', async () => {
      try {
        standaloneClient.sendCommand.mockRejectedValueOnce(new Error('NOPERM'));
        await service.libraryList(mockClientMetadata);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(ForbiddenException);
      }
    });

    it('should handle HTTP error', async () => {
      try {
        standaloneClient.sendCommand.mockRejectedValueOnce(new NotFoundException('Not Found'));
        await service.libraryList(mockClientMetadata);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('upload', () => {
    it('should upload library', async () => {
      standaloneClient.sendCommand.mockResolvedValueOnce(mockLibrariesReply);
      await service.upload(mockClientMetadata, { code: mockCode });

      expect(standaloneClient.sendCommand).toHaveBeenCalledTimes(1);
      expect(standaloneClient.sendCommand).toHaveBeenCalledWith(
        ['TFUNCTION', 'LOAD', mockCode],
        expect.anything(),
      );
    });

    it('should upload library with configuration', async () => {
      standaloneClient.sendCommand.mockResolvedValueOnce(mockLibrariesReply);
      await service.upload(mockClientMetadata, { code: mockCode, configuration: mockConfig });

      expect(standaloneClient.sendCommand).toHaveBeenCalledTimes(1);
      expect(standaloneClient.sendCommand).toHaveBeenCalledWith(
        ['TFUNCTION', 'LOAD', 'CONFIG', mockConfig, mockCode],
        expect.anything(),
      );
    });

    it('should replace library', async () => {
      standaloneClient.sendCommand.mockResolvedValueOnce(mockLibrariesReply);
      await service.upload(mockClientMetadata, { code: mockCode }, true);

      expect(standaloneClient.sendCommand).toHaveBeenCalledTimes(1);
      expect(standaloneClient.sendCommand).toHaveBeenCalledWith(
        ['TFUNCTION', 'LOAD', 'REPLACE', mockCode],
        expect.anything(),
      );
    });

    it('should replace library with configuration', async () => {
      standaloneClient.sendCommand.mockResolvedValueOnce(mockLibrariesReply);
      await service.upload(mockClientMetadata, { code: mockCode, configuration: mockConfig }, true);

      expect(standaloneClient.sendCommand).toHaveBeenCalledTimes(1);
      expect(standaloneClient.sendCommand).toHaveBeenCalledWith(
        ['TFUNCTION', 'LOAD', 'REPLACE', 'CONFIG', mockConfig, mockCode],
        expect.anything(),
      );
    });

    it('Should throw Error when error during creating a client in upload', async () => {
      try {
        standaloneClient.sendCommand.mockRejectedValueOnce(new Error());
        await service.upload(mockClientMetadata, { code: mockCode });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
      }
    });

    it('should handle acl error', async () => {
      try {
        standaloneClient.sendCommand.mockRejectedValueOnce(new Error('NOPERM'));
        await service.upload(mockClientMetadata, { code: mockCode });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(ForbiddenException);
      }
    });

    it('should handle HTTP error', async () => {
      try {
        standaloneClient.sendCommand.mockRejectedValueOnce(new NotFoundException('Not Found'));
        await service.upload(mockClientMetadata, { code: mockCode });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });

    it('should call refresh cluster', async () => {
      databaseClientFactory.getOrCreateClient.mockResolvedValueOnce(clusterClient);
      const refreshClusterSpy = jest.spyOn(service as any, 'refreshCluster');
      refreshClusterSpy.mockResolvedValue(null);

      await service.upload(mockClientMetadata, { code: mockCode, configuration: mockConfig }, true);
      expect(refreshClusterSpy).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete library', async () => {
      standaloneClient.sendCommand.mockResolvedValueOnce('OK');

      expect(await service.delete(mockClientMetadata, mockLibraryName)).toEqual(undefined);
    });

    it('Should throw Error when error during creating a client in delete', async () => {
      try {
        standaloneClient.sendCommand.mockRejectedValueOnce(new Error());
        await service.delete(mockClientMetadata, mockLibraryName);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
      }
    });

    it('should handle acl error', async () => {
      try {
        standaloneClient.sendCommand.mockRejectedValueOnce(new Error('NOPERM'));
        await service.delete(mockClientMetadata, mockLibraryName);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(ForbiddenException);
      }
    });

    it('should handle HTTP error during deleting library', async () => {
      try {
        standaloneClient.sendCommand.mockRejectedValueOnce(new NotFoundException('Not Found'));
        await service.delete(mockClientMetadata, mockLibraryName);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });

    it('should call refresh cluster', async () => {
      databaseClientFactory.getOrCreateClient.mockResolvedValueOnce(clusterClient);
      const refreshClusterSpy = jest.spyOn(service as any, 'refreshCluster');
      refreshClusterSpy.mockResolvedValue(null);

      await service.delete(mockClientMetadata, mockLibraryName);
      expect(refreshClusterSpy).toHaveBeenCalled();
    });
  });

  describe('refreshCluster', () => {
    it('should call REDISGEARS_2.REFRESHCLUSTER on each shard', async () => {
      clusterClient.sendCommand.mockResolvedValue(null);
      await service['refreshCluster'](clusterClient);

      expect(clusterClient.nodes).toBeCalledTimes(1);
      expect(clusterNode1.sendCommand).toHaveBeenCalledWith(['REDISGEARS_2.REFRESHCLUSTER']);
      expect(clusterNode2.sendCommand).toHaveBeenCalledWith(['REDISGEARS_2.REFRESHCLUSTER']);
    });
  });
});
