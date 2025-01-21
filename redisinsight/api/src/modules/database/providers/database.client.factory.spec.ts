import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  mockCommonClientMetadata,
  mockDatabase,
  mockDatabaseAnalytics,
  mockDatabaseRepository,
  mockDatabaseService,
  mockRedisNoAuthError,
  MockType,
  mockRedisClientFactory,
  mockStandaloneRedisClient,
  mockSessionMetadata,
  MockRedisClient,
} from 'src/__mocks__';
import { DatabaseAnalytics } from 'src/modules/database/database.analytics';
import { DatabaseService } from 'src/modules/database/database.service';
import { DatabaseRepository } from 'src/modules/database/repositories/database.repository';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import { RedisClientStorage } from 'src/modules/redis/redis.client.storage';
import { RedisClientFactory } from 'src/modules/redis/redis.client.factory';
import { ClientContext, ClientMetadata } from 'src/common/models';
import { v4 as uuidv4 } from 'uuid';
import { LocalRedisClientFactory } from 'src/modules/redis/local.redis.client.factory';
import { IoredisRedisConnectionStrategy } from 'src/modules/redis/connection/ioredis.redis.connection.strategy';
import { NodeRedisConnectionStrategy } from 'src/modules/redis/connection/node.redis.connection.strategy';
import {
  mockIoRedisRedisConnectionStrategy,
  mockNodeRedisConnectionStrategy,
} from 'src/__mocks__/redis-client';
import { RedisClient } from 'src/modules/redis/client';
import { ConnectionType } from 'src/modules/database/entities/database.entity';

describe('DatabaseClientFactory', () => {
  let service: DatabaseClientFactory;
  let databaseService: MockType<DatabaseService>;
  let databaseRepository: MockType<DatabaseRepository>;
  let redisClientStorage: RedisClientStorage;
  let redisClientFactory: LocalRedisClientFactory;
  let analytics: MockType<DatabaseAnalytics>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseClientFactory,
        {
          provide: DatabaseService,
          useFactory: mockDatabaseService,
        },
        {
          provide: DatabaseRepository,
          useFactory: mockDatabaseRepository,
        },
        {
          provide: DatabaseAnalytics,
          useFactory: mockDatabaseAnalytics,
        },
        RedisClientStorage,
        {
          provide: RedisClientFactory,
          useClass: mockRedisClientFactory,
        },
        {
          provide: IoredisRedisConnectionStrategy,
          useFactory: mockIoRedisRedisConnectionStrategy,
        },
        {
          provide: NodeRedisConnectionStrategy,
          useFactory: mockNodeRedisConnectionStrategy,
        },
      ],
    }).compile();

    service = await module.get(DatabaseClientFactory);
    databaseService = await module.get(DatabaseService);
    databaseRepository = await module.get(DatabaseRepository);
    redisClientStorage = await module.get(RedisClientStorage);
    redisClientFactory = await module.get(RedisClientFactory);
    analytics = await module.get(DatabaseAnalytics);
  });

  describe('getOrCreateClient', () => {
    it('should get existing client', async () => {
      const spyOnGetByMetadata = jest
        .spyOn(redisClientStorage, 'getByMetadata')
        .mockResolvedValueOnce(mockStandaloneRedisClient);
      const spyOnSet = jest.spyOn(redisClientStorage, 'set');

      expect(await service.getOrCreateClient(mockCommonClientMetadata)).toEqual(
        mockStandaloneRedisClient,
      );
      expect(spyOnGetByMetadata).toHaveBeenCalledWith(mockCommonClientMetadata);
      expect(spyOnSet).not.toHaveBeenCalled();
    });

    it('should create new and save it client', async () => {
      const spyOnGetByMetadata = jest
        .spyOn(redisClientStorage, 'getByMetadata')
        .mockResolvedValueOnce(null);
      const spyOnSet = jest.spyOn(redisClientStorage, 'set');

      const result = await service.getOrCreateClient(mockCommonClientMetadata);
      expect(result).toBeInstanceOf(RedisClient);
      expect(result.clientMetadata.sessionMetadata).toBe(mockSessionMetadata);
      expect(spyOnGetByMetadata).toHaveBeenCalledWith(mockCommonClientMetadata);
      expect(spyOnSet).toHaveBeenCalledWith(result);
    });

    it('should only instantiate a single client per unique client metadata', async () => {
      const mockClientMetadata2: ClientMetadata = {
        sessionMetadata: {
          userId: '4',
          sessionId: uuidv4(),
        },
        databaseId: uuidv4(),
        context: ClientContext.Common,
      };

      const clients1 = await Promise.all([
        service.getOrCreateClient(mockCommonClientMetadata),
        service.getOrCreateClient(mockCommonClientMetadata),
        service.getOrCreateClient(mockCommonClientMetadata),
      ]);

      // assert that all returned clients are the same instance
      let currentClient = clients1.shift();
      expect(currentClient).toBeInstanceOf(MockRedisClient);
      expect(currentClient.clientMetadata).toEqual(mockCommonClientMetadata);
      while (clients1.length) {
        expect(currentClient).toBe(clients1[0]);
        currentClient = clients1.shift();
      }

      // test with a separate user/metadata
      const clients2 = await Promise.all([
        service.getOrCreateClient(mockClientMetadata2),
        service.getOrCreateClient(mockClientMetadata2),
        service.getOrCreateClient(mockClientMetadata2),
      ]);
      currentClient = clients2.shift();
      expect(currentClient).toBeInstanceOf(MockRedisClient);
      expect(currentClient.clientMetadata).toEqual(mockClientMetadata2);
      while (clients2.length) {
        expect(currentClient).toBe(clients2[0]);
        currentClient = clients2.shift();
      }

      expect(redisClientFactory.createClient).toHaveBeenCalledTimes(2);
    });

    it('should reject multiple failed calls with the same error instance', async () => {
      const mockCommonClientMetadata2: ClientMetadata = {
        sessionMetadata: {
          userId: '4',
          sessionId: uuidv4(),
        },
        databaseId: uuidv4(),
        context: ClientContext.Common,
      };
      const error1 = new Error('Error 1');
      const error2 = new Error('Error 2');

      const createClientSpy = jest
        .spyOn(service, 'createClient')
        .mockImplementationOnce(
          () => new Promise((_, reject) => {
            reject(error1);
          }),
        )
        .mockImplementationOnce(
          () => new Promise((_, reject) => {
            reject(error2);
          }),
        );

      const clients = await Promise.all([
        service
          .getOrCreateClient(mockCommonClientMetadata)
          .catch((err) => ({ error: err })),
        service
          .getOrCreateClient(mockCommonClientMetadata)
          .catch((err) => ({ error: err })),
        service
          .getOrCreateClient(mockCommonClientMetadata)
          .catch((err) => ({ error: err })),
        service
          .getOrCreateClient(mockCommonClientMetadata2)
          .catch((err) => ({ error: err })),
        service
          .getOrCreateClient(mockCommonClientMetadata2)
          .catch((err) => ({ error: err })),
      ]);

      expect(createClientSpy).toHaveBeenCalledTimes(2);

      for (let a = 0; a < 3; a += 1) {
        const resp = clients[a] as { error?: any };
        expect(resp.error).toBe(error1);
      }
      for (let a = 3; a < clients.length; a += 1) {
        const resp = clients[a] as { error?: any };
        expect(resp.error).toBe(error2);
      }
    });
  });

  describe('createClient', () => {
    it('should create new client and not update connection type', async () => {
      jest.spyOn(redisClientFactory, 'createClient').mockResolvedValueOnce(mockStandaloneRedisClient);
      expect(await service.createClient(mockCommonClientMetadata)).toEqual(mockStandaloneRedisClient);
      expect(databaseService.get).toHaveBeenCalledWith(mockSessionMetadata, mockCommonClientMetadata.databaseId);
      expect(databaseRepository.update).not.toHaveBeenCalled();
    });
    it('should create new client and update connection type (first connection)', async () => {
      jest.spyOn(redisClientFactory, 'createClient').mockResolvedValueOnce(mockStandaloneRedisClient);
      databaseService.get.mockResolvedValueOnce({ ...mockDatabase, connectionType: ConnectionType.NOT_CONNECTED });
      expect(await service.createClient(mockCommonClientMetadata)).toEqual(mockStandaloneRedisClient);
      expect(databaseService.get).toHaveBeenCalledWith(mockSessionMetadata, mockCommonClientMetadata.databaseId);
      expect(databaseRepository.update).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockCommonClientMetadata.databaseId,
        {
          connectionType: mockDatabase.connectionType,
        },
      );
    });
    it('should throw Unauthorized error in case of NOAUTH', async () => {
      jest.spyOn(redisClientFactory, 'createClient').mockRejectedValue(mockRedisNoAuthError);
      await expect(service.createClient(mockCommonClientMetadata)).rejects.toThrow(UnauthorizedException);
      expect(analytics.sendConnectionFailedEvent).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockDatabase,
        new UnauthorizedException(ERROR_MESSAGES.AUTHENTICATION_FAILED()),
      );
    });
  });
});
