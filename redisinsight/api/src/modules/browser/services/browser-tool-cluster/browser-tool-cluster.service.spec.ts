import { Test, TestingModule } from '@nestjs/testing';
import * as IORedis from 'ioredis';
import * as Redis from 'ioredis-mock';
import {
  RedisService,
} from 'src/modules/redis/redis.service';
import {
  BrowserToolCommands,
  BrowserToolKeysCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { InternalServerErrorException } from '@nestjs/common';
import {
  BrowserToolClusterService,
} from 'src/modules/browser/services/browser-tool-cluster/browser-tool-cluster.service';
import { ClusterNodeNotFoundError } from 'src/modules/cli/constants/errors';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { DatabaseService } from 'src/modules/database/database.service';
import { mockBrowserClientMetadata, mockRedisConnectionFactory } from 'src/__mocks__';
import { RedisConnectionFactory } from 'src/modules/redis/redis-connection.factory';

const mockClient = new Redis();
const mockCluster = new Redis.Cluster([]);
const mockClusterNode1 = new Redis();
const mockClusterNode2 = new Redis();
mockClusterNode1.call = jest.fn();
mockClusterNode1.sendCommand = jest.fn();
mockClusterNode2.call = jest.fn();
mockClusterNode2.sendCommand = jest.fn();
mockClusterNode1.options = { host: '127.0.0.1', port: 7001 };
mockClusterNode2.options = { host: '127.0.0.1', port: 7002 };
const mockConnectionErrorMessage = 'Could not connect to localhost, please check the connection details.';

describe('BrowserToolClusterService', () => {
  let service: BrowserToolClusterService;
  let getRedisClient;
  let execPipelineFromClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrowserToolClusterService,
        {
          provide: RedisService,
          useFactory: () => ({}),
        },
        {
          provide: RedisConnectionFactory,
          useFactory: mockRedisConnectionFactory,
        },
        {
          provide: DatabaseService,
          useFactory: () => ({}),
        },
      ],
    }).compile();

    service = await module.get<BrowserToolClusterService>(
      BrowserToolClusterService,
    );
    getRedisClient = jest.spyOn<BrowserToolClusterService, any>(
      service,
      'getRedisClient',
    );
    execPipelineFromClient = jest.spyOn<BrowserToolClusterService, any>(
      service,
      'execPipelineFromClient',
    );
    mockClient.call = jest.fn();
  });

  describe('execCommand', () => {
    const keyName = 'keyName';
    it('should call send_command with correct args', async () => {
      getRedisClient.mockResolvedValue(mockClient);

      await service.execCommand(
        mockBrowserClientMetadata,
        BrowserToolKeysCommands.MemoryUsage,
        [keyName],
      );

      expect(mockClient.call).toHaveBeenCalledWith('memory', [
        'usage',
        keyName,
      ]);
    });
    it('should throw error for execCommand', async () => {
      const error = new InternalServerErrorException(
        mockConnectionErrorMessage,
      );
      getRedisClient.mockRejectedValue(error);

      await expect(
        service.execCommand(
          mockBrowserClientMetadata,
          BrowserToolKeysCommands.MemoryUsage,
          [keyName],
        ),
      ).rejects.toThrow(InternalServerErrorException);
      expect(mockClient.call).not.toHaveBeenCalled();
    });
  });

  describe('execPipeline', () => {
    const keyName = 'keyName';
    const args: Array<
    [toolCommand: BrowserToolCommands, ...args: Array<string | number>]
    > = [
      [BrowserToolKeysCommands.Type, keyName],
      [BrowserToolKeysCommands.Ttl, keyName],
    ];
    it('should call execPipelineFromClient with correct args', async () => {
      getRedisClient.mockResolvedValue(mockClient);
      execPipelineFromClient.mockResolvedValue();

      await service.execPipeline(mockBrowserClientMetadata, args);

      expect(execPipelineFromClient).toHaveBeenCalledWith(mockClient, args);
    });
    it('should throw error for execPipeline', async () => {
      const error = new InternalServerErrorException(
        mockConnectionErrorMessage,
      );
      getRedisClient.mockRejectedValue(error);

      await expect(
        service.execPipeline(mockBrowserClientMetadata, args),
      ).rejects.toThrow(InternalServerErrorException);
      expect(execPipelineFromClient).not.toHaveBeenCalled();
    });
  });

  describe('execCommandFromNodes', () => {
    mockCluster.nodes = jest.fn();
    const keyName = 'keyName';

    it('should execute command for all nodes', async () => {
      getRedisClient.mockResolvedValue(mockCluster);
      mockClusterNode1.call.mockResolvedValue(70);
      mockClusterNode2.call.mockResolvedValue(10);
      mockCluster.nodes.mockReturnValue([mockClusterNode1, mockClusterNode2]);

      const result = await service.execCommandFromNodes(
        mockBrowserClientMetadata,
        BrowserToolKeysCommands.MemoryUsage,
        [keyName],
        'all',
      );

      expect(result).toEqual([
        { result: 70, ...mockClusterNode1.options },
        { result: 10, ...mockClusterNode2.options },
      ]);
      expect(mockClusterNode1.call).toHaveBeenCalledWith('memory', [
        'usage',
        keyName,
      ]);
      expect(mockClusterNode2.call).toHaveBeenCalledWith('memory', [
        'usage',
        keyName,
      ]);
    });
    it('should throw error for execCommandFromNodes', async () => {
      const error = new InternalServerErrorException(
        'Could not connect to localhost, please check the connection details.',
      );
      getRedisClient.mockRejectedValue(error);

      await expect(
        service.execCommandFromNodes(
          mockBrowserClientMetadata,
          BrowserToolKeysCommands.MemoryUsage,
          [keyName],
          'all',
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('execCommandFromNode', () => {
    mockCluster.nodes = jest.fn();
    const keyName = 'keyName';

    it('should execute command from node', async () => {
      getRedisClient.mockResolvedValue(mockCluster);
      mockClusterNode1.sendCommand.mockResolvedValue(70);
      mockCluster.nodes.mockReturnValue([mockClusterNode1, mockClusterNode2]);

      const result = await service.execCommandFromNode(
        mockBrowserClientMetadata,
        BrowserToolKeysCommands.MemoryUsage,
        [keyName],
        { ...mockClusterNode1.options },
      );

      expect(result).toEqual({ result: 70, ...mockClusterNode1.options });

      expect(
        JSON.parse(JSON.stringify(mockClusterNode1.sendCommand.mock.calls[0])),
      ).toStrictEqual(JSON.parse(JSON.stringify(([
        new IORedis.Command('memory', [
          'usage',
          keyName,
        ], {
          replyEncoding: 'utf8',
        }),
      ]))));
    });
    it('should throw error that cluster node not found', async () => {
      const nodeOptions = { host: '127.0.0.1', port: 7003 };
      const error = new ClusterNodeNotFoundError(
        ERROR_MESSAGES.CLUSTER_NODE_NOT_FOUND(
          `${nodeOptions.host}:${nodeOptions.port}`,
        ),
      );
      getRedisClient.mockResolvedValue(mockCluster);
      mockCluster.nodes.mockReturnValue([mockClusterNode1, mockClusterNode2]);

      await expect(
        service.execCommandFromNode(
          mockBrowserClientMetadata,
          BrowserToolKeysCommands.MemoryUsage,
          [keyName],
          nodeOptions,
        ),
      ).rejects.toThrow(error);
    });
    it('should throw error for execCommandFromNode', async () => {
      const error = new InternalServerErrorException(
        mockConnectionErrorMessage,
      );
      getRedisClient.mockRejectedValue(error);

      await expect(
        service.execCommandFromNode(
          mockBrowserClientMetadata,
          BrowserToolKeysCommands.MemoryUsage,
          [keyName],
          { ...mockClusterNode1.options },
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
