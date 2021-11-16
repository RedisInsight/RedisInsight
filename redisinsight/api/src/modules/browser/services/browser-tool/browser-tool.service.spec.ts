import { Test, TestingModule } from '@nestjs/testing';
import * as Redis from 'ioredis-mock';
import { mockStandaloneDatabaseEntity } from 'src/__mocks__';
import {
  IFindRedisClientInstanceByOptions,
  RedisService,
} from 'src/modules/core/services/redis/redis.service';
import { InstancesBusinessService } from 'src/modules/shared/services/instances-business/instances-business.service';
import { BrowserToolService } from 'src/modules/browser/services/browser-tool/browser-tool.service';
import {
  BrowserToolCommands,
  BrowserToolKeysCommands,
  BrowserToolStringCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { InternalServerErrorException } from '@nestjs/common';

const mockClientOptions: IFindRedisClientInstanceByOptions = {
  instanceId: mockStandaloneDatabaseEntity.id,
};

const mockClient = new Redis();
const mockConnectionErrorMessage = 'Could not connect to localhost, please check the connection details.';

describe('BrowserToolService', () => {
  let service: BrowserToolService;
  let getRedisClient;
  let execPipelineFromClient;
  let execMultiFromClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrowserToolService,
        {
          provide: RedisService,
          useFactory: () => ({}),
        },
        {
          provide: InstancesBusinessService,
          useFactory: () => ({}),
        },
      ],
    }).compile();

    service = await module.get<BrowserToolService>(BrowserToolService);
    getRedisClient = jest.spyOn<BrowserToolService, any>(
      service,
      'getRedisClient',
    );
    execPipelineFromClient = jest.spyOn<BrowserToolService, any>(
      service,
      'execPipelineFromClient',
    );
    execMultiFromClient = jest.spyOn<BrowserToolService, any>(
      service,
      'execMultiFromClient',
    );
    mockClient.send_command = jest.fn();
  });

  describe('execCommand', () => {
    const keyName = 'keyName';
    it('should call send_command with correct args', async () => {
      getRedisClient.mockResolvedValue(mockClient);

      await service.execCommand(
        mockClientOptions,
        BrowserToolKeysCommands.MemoryUsage,
        [keyName],
      );

      expect(mockClient.send_command).toHaveBeenCalledWith('memory', [
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
          mockClientOptions,
          BrowserToolKeysCommands.MemoryUsage,
          [keyName],
        ),
      ).rejects.toThrow(InternalServerErrorException);
      expect(mockClient.send_command).not.toHaveBeenCalled();
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

      await service.execPipeline(mockClientOptions, args);

      expect(execPipelineFromClient).toHaveBeenCalledWith(mockClient, args);
    });
    it('should throw error', async () => {
      const error = new InternalServerErrorException(
        mockConnectionErrorMessage,
      );
      getRedisClient.mockRejectedValue(error);

      await expect(
        service.execPipeline(mockClientOptions, args),
      ).rejects.toThrow(InternalServerErrorException);
      expect(execPipelineFromClient).not.toHaveBeenCalled();
    });
  });

  describe('execMulti', () => {
    const keyName = 'keyName';
    const args: Array<
    [toolCommand: BrowserToolCommands, ...args: Array<string | number>]
    > = [
      [BrowserToolStringCommands.Set, keyName],
      [BrowserToolStringCommands.Get, keyName],
    ];
    it('should call execMultiFromClient with correct args', async () => {
      getRedisClient.mockResolvedValue(mockClient);
      execPipelineFromClient.mockResolvedValue();

      await service.execMulti(mockClientOptions, args);

      expect(execMultiFromClient).toHaveBeenCalledWith(mockClient, args);
    });
    it('should throw error', async () => {
      const error = new InternalServerErrorException(
        mockConnectionErrorMessage,
      );
      getRedisClient.mockRejectedValue(error);

      await expect(service.execMulti(mockClientOptions, args)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(execMultiFromClient).not.toHaveBeenCalled();
    });
  });
});
