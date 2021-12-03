import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as Redis from 'ioredis-mock';
import { v4 as uuidv4 } from 'uuid';
import { mockRepository, mockStandaloneDatabaseEntity } from 'src/__mocks__';
import { AppTool } from 'src/models';
import {
  IFindRedisClientInstanceByOptions,
  IRedisClientInstance,
  RedisService,
} from 'src/modules/core/services/redis/redis.service';
import { InstancesBusinessService } from 'src/modules/shared/services/instances-business/instances-business.service';
import { BrowserToolService } from 'src/modules/browser/services/browser-tool/browser-tool.service';
import { DatabaseInstanceEntity } from 'src/modules/core/models/database-instance.entity';
import { CONNECTION_NAME_GLOBAL_PREFIX } from 'src/constants';

const mockClientOptions: IFindRedisClientInstanceByOptions = {
  instanceId: mockStandaloneDatabaseEntity.id,
};

export const mockRedisClientInstance: IRedisClientInstance = {
  uuid: uuidv4(),
  tool: AppTool.Browser,
  instanceId: mockClientOptions.instanceId,
  client: new Redis(),
  lastTimeUsed: 1619791508019,
};

describe('RedisConsumerAbstractService', () => {
  let redisService;
  let instancesBusinessService;
  let consumerInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrowserToolService,
        {
          provide: getRepositoryToken(DatabaseInstanceEntity),
          useFactory: mockRepository,
        },
        {
          provide: RedisService,
          useFactory: () => ({
            getClientInstance: jest.fn(),
            selectDatabase: jest.fn(),
            setClientInstance: jest.fn(),
            isClientConnected: jest.fn(),
            removeClientInstance: jest.fn(),
            connectToDatabaseInstance: jest.fn(),
          }),
        },
        {
          provide: InstancesBusinessService,
          useFactory: () => ({
            getOneById: jest.fn(),
          }),
        },
      ],
    }).compile();

    redisService = await module.get<RedisService>(RedisService);
    instancesBusinessService = await module.get<InstancesBusinessService>(
      InstancesBusinessService,
    );
    consumerInstance = await module.get<BrowserToolService>(BrowserToolService);
  });

  describe('getRedisClient', () => {
    beforeEach(() => {
      consumerInstance.createNewClient = jest.fn();
    });
    it('create new redis client', async () => {
      redisService.getClientInstance.mockReturnValue(null);
      consumerInstance.createNewClient.mockResolvedValue(
        mockRedisClientInstance.client,
      );

      const result = await consumerInstance.getRedisClient(mockClientOptions);

      expect(result).toEqual(mockRedisClientInstance.client);
      expect(consumerInstance.createNewClient).toHaveBeenCalled();
    });
    it('existing client has connection', async () => {
      redisService.getClientInstance.mockReturnValue(mockRedisClientInstance);
      redisService.isClientConnected.mockReturnValue(true);

      const result = await consumerInstance.getRedisClient(mockClientOptions);

      expect(result).toEqual(mockRedisClientInstance.client);
      expect(consumerInstance.createNewClient).not.toHaveBeenCalled();
      expect(redisService.selectDatabase).not.toHaveBeenCalled();
    });
    it('existing client has no connection', async () => {
      redisService.getClientInstance.mockReturnValue(mockRedisClientInstance);
      redisService.isClientConnected.mockReturnValue(false);
      consumerInstance.createNewClient.mockResolvedValue(
        mockRedisClientInstance.client,
      );

      const result = await consumerInstance.getRedisClient(mockClientOptions);

      expect(result).toEqual(mockRedisClientInstance.client);
      expect(consumerInstance.createNewClient).toHaveBeenCalled();
    });
    it('select redis database by number', async () => {
      redisService.getClientInstance.mockReturnValue(mockRedisClientInstance);
      redisService.isClientConnected.mockReturnValue(true);

      await expect(
        consumerInstance.getRedisClient({
          ...mockClientOptions,
        }),
      ).resolves.not.toThrow();

      expect(consumerInstance.createNewClient).not.toHaveBeenCalled();
    });
    it("can't create redis client", async () => {
      const error = new BadRequestException(
        ' Could not connect to localhost, please check the connection details.',
      );
      redisService.getClientInstance.mockReturnValue(null);
      consumerInstance.createNewClient.mockRejectedValue(error);

      await expect(
        consumerInstance.getRedisClient({
          ...mockClientOptions,
          dbNumber: 1,
        }),
      ).rejects.toThrow(error);
    });
  });

  describe('createNewClient', () => {
    beforeEach(() => {
      instancesBusinessService.getOneById.mockResolvedValue(
        mockStandaloneDatabaseEntity,
      );
    });
    it('create new redis client', async () => {
      redisService.connectToDatabaseInstance.mockResolvedValue(
        mockRedisClientInstance.client,
      );

      const result = await consumerInstance.createNewClient(
        mockRedisClientInstance.instanceId,
      );

      expect(result).toEqual(mockRedisClientInstance.client);
    });
    it("can't create redis client", async () => {
      const error = new BadRequestException(
        ' Could not connect to localhost, please check the connection details.',
      );
      redisService.connectToDatabaseInstance.mockRejectedValue(error);

      await expect(
        consumerInstance.createNewClient(mockRedisClientInstance.instanceId),
      ).rejects.toThrow(error);
    });
  });

  describe('execPipelineFromClient', () => {
    let client;
    const mockPipelineCommands = [['module list'], ['keys', '*']];
    beforeEach(() => {
      client = mockRedisClientInstance.client;
      client.pipeline = jest.fn();
    });
    it('succeed to execute pipeline from redis client', async () => {
      client.pipeline.mockReturnValue({
        exec: jest.fn((callback) => callback([null, []])),
      });

      await expect(
        consumerInstance.execPipelineFromClient(client, mockPipelineCommands),
      ).resolves.not.toThrow();
      expect(client.pipeline).toHaveBeenCalledWith([
        ['module', 'list'],
        ['keys', '*'],
      ]);
    });
  });

  describe('execMultiFromClient', () => {
    let client;
    const mockPipelineCommands = [['module list'], ['keys', '*']];
    beforeEach(() => {
      client = mockRedisClientInstance.client;
      client.multi = jest.fn();
    });
    it('succeed to execute multi from redis client', async () => {
      client.multi.mockReturnValue({
        exec: jest.fn((callback) => callback([null, []])),
      });

      await expect(
        consumerInstance.execMultiFromClient(client, mockPipelineCommands),
      ).resolves.not.toThrow();
      expect(client.pipeline).toHaveBeenCalledWith([
        ['module', 'list'],
        ['keys', '*'],
      ]);
    });
  });

  describe('getRedisClientNamespace', () => {
    const mockClient = Object.create(Redis.prototype);
    mockClient.options = {
      ...mockClient.options,
      connectionName: `${CONNECTION_NAME_GLOBAL_PREFIX}-common-235e72f4`,
    };

    it('succeed to get client namespace', async () => {
      redisService.getClientInstance.mockReturnValue({ ...mockRedisClientInstance, client: mockClient });

      const namespace = consumerInstance.getRedisClientNamespace({
        uuid: mockClient.uuid,
        instanceId: mockClient.instanceId,
      });

      expect(namespace).toEqual('common');
    });
    it('failed to get client namespace', () => {
      redisService.getClientInstance.mockReturnValue(undefined);

      const namespace = consumerInstance.getRedisClientNamespace({
        uuid: mockClient.uuid,
        instanceId: mockClient.instanceId,
      });

      expect(namespace).toEqual('');
    });
  });
});
