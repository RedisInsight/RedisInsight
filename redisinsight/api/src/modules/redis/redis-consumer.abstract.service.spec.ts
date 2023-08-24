import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import * as Redis from 'ioredis-mock';
import {
  mockDatabase, mockDatabaseService, mockRedisClientInstance, mockRedisConnectionFactory,
} from 'src/__mocks__';
import { RedisService } from 'src/modules/redis/redis.service';
import { BrowserToolService } from 'src/modules/browser/services/browser-tool/browser-tool.service';
import { CONNECTION_NAME_GLOBAL_PREFIX } from 'src/constants';
import { RedisConsumerAbstractService } from 'src/modules/redis/redis-consumer.abstract.service';
import { ClientNotFoundErrorException } from 'src/modules/redis/exceptions/client-not-found-error.exception';
import { DatabaseService } from 'src/modules/database/database.service';
import { ClientContext, ClientMetadata } from 'src/common/models';
import { RedisConnectionFactory } from 'src/modules/redis/redis-connection.factory';

const mockClientMetadata: ClientMetadata = {
  sessionMetadata: undefined,
  databaseId: mockDatabase.id,
  context: ClientContext.Browser,
};

describe('RedisConsumerAbstractService', () => {
  let redisService;
  let redisConnectionFactory;
  let instancesBusinessService;
  let consumerInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrowserToolService,
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
          provide: RedisConnectionFactory,
          useFactory: mockRedisConnectionFactory,
        },
        {
          provide: DatabaseService,
          useFactory: mockDatabaseService,
        },
      ],
    }).compile();

    redisService = await module.get<RedisService>(RedisService);
    consumerInstance = await module.get<BrowserToolService>(BrowserToolService);
    redisConnectionFactory = await module.get(RedisConnectionFactory);

    redisService.setClientInstance.mockReturnValue(mockRedisClientInstance);
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

      const result = await consumerInstance.getRedisClient(mockClientMetadata);

      expect(result).toEqual(mockRedisClientInstance.client);
      expect(consumerInstance.createNewClient).toHaveBeenCalled();
    });
    it('existing client has connection', async () => {
      redisService.getClientInstance.mockReturnValue(mockRedisClientInstance);
      redisService.isClientConnected.mockReturnValue(true);

      const result = await consumerInstance.getRedisClient(mockClientMetadata);

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

      const result = await consumerInstance.getRedisClient(mockClientMetadata);

      expect(result).toEqual(mockRedisClientInstance.client);
      expect(consumerInstance.createNewClient).toHaveBeenCalled();
    });
    it('select redis database by number', async () => {
      redisService.getClientInstance.mockReturnValue(mockRedisClientInstance);
      redisService.isClientConnected.mockReturnValue(true);

      await expect(
        consumerInstance.getRedisClient({
          ...mockClientMetadata,
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
          ...mockClientMetadata,
          dbNumber: 1,
        }),
      ).rejects.toThrow(error);
    });
    it('should throw error if autoConnection disabled', async () => {
      redisService.getClientInstance.mockReturnValue(null);
      // @ts-ignore
      class Tool extends RedisConsumerAbstractService {
        constructor() {
          super(
            ClientContext.CLI,
            redisService,
            redisConnectionFactory,
            instancesBusinessService,
            { enableAutoConnection: false },
          );
        }
      }

      await expect(new Tool().getRedisClient(mockClientMetadata))
        .rejects.toThrow(new ClientNotFoundErrorException());
    });
  });

  describe('createNewClient', () => {
    it('create new redis client', async () => {
      redisConnectionFactory.createRedisConnection.mockResolvedValue(
        mockRedisClientInstance.client,
      );

      const result = await consumerInstance.createNewClient(mockRedisClientInstance.clientMetadata);

      expect(result).toEqual(mockRedisClientInstance.client);
    });
    it("can't create redis client", async () => {
      const error = new BadRequestException(
        ' Could not connect to localhost, please check the connection details.',
      );
      redisConnectionFactory.createRedisConnection.mockRejectedValue(error);

      await expect(
        consumerInstance.createNewClient(mockRedisClientInstance.clientMetadata),
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
