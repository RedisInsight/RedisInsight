import { Test, TestingModule } from '@nestjs/testing';
import {
  generateMockRedisClientInstance,
  mockDatabase,
  mockIORedisClient, mockIORedisSentinel,
  mockRedisConnectionFactory,
} from 'src/__mocks__';
import { ClientContext, SessionMetadata } from 'src/common/models';
import { RedisConnectionFactory } from 'src/modules/redis/redis-connection.factory';
import apiConfig from 'src/utils/config';
import { RedisService } from './redis.service';

const REDIS_CLIENTS_CONFIG = apiConfig.get('redis_clients');

describe('RedisService', () => {
  let service: RedisService;
  const mockClientMetadata1 = {
    sessionMetadata: {
      userId: 'u1',
      sessionId: 's1',
    },
    databaseId: mockDatabase.id,
    context: ClientContext.Common,
  };

  const mockRedisClientInstance1 = generateMockRedisClientInstance(mockClientMetadata1);
  const mockRedisClientInstance2 = generateMockRedisClientInstance({
    ...mockClientMetadata1,
    context: ClientContext.Browser,
    db: 0,
  });
  const mockRedisClientInstance3 = generateMockRedisClientInstance({
    ...mockClientMetadata1,
    sessionMetadata: { userId: 'u2', sessionId: 's2' },
    context: ClientContext.Workbench,
    db: 1,
  });
  const mockRedisClientInstance4 = generateMockRedisClientInstance({
    ...mockClientMetadata1,
    sessionMetadata: { userId: 'u2', sessionId: 's3' },
    db: 2,
  });
  const mockRedisClientInstance5 = generateMockRedisClientInstance({
    ...mockClientMetadata1,
    databaseId: 'd2',
    sessionMetadata: { userId: 'u2', sessionId: 's4' },
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: RedisConnectionFactory,
          useFactory: mockRedisConnectionFactory,
        },
      ],
    }).compile();

    service = await module.get(RedisService);

    service.clients = new Map();
    service.clients.set(mockRedisClientInstance1.id, mockRedisClientInstance1);
    service.clients.set(mockRedisClientInstance2.id, mockRedisClientInstance2);
    service.clients.set(mockRedisClientInstance3.id, mockRedisClientInstance3);
    service.clients.set(mockRedisClientInstance4.id, mockRedisClientInstance4);
    service.clients.set(mockRedisClientInstance5.id, mockRedisClientInstance5);
  });

  afterEach(() => {
    service.onModuleDestroy();
  });

  describe('isClientConnected', () => {
    it('should not remove any client since no idle time passed', async () => {
      expect(service.clients.size).toEqual(5);

      service['syncClients']();

      expect(service.clients.size).toEqual(5);
    });

    it('should remove client with exceeded time in idle', async () => {
      expect(service.clients.size).toEqual(5);
      const toDelete = service.clients.get(mockRedisClientInstance1.id);
      toDelete.lastTimeUsed = Date.now() - REDIS_CLIENTS_CONFIG.maxIdleThreshold;

      service['syncClients']();

      expect(service.clients.size).toEqual(4);
      expect(service.clients.get(mockRedisClientInstance1.id)).toEqual(undefined);
    });
  });

  describe('getClientInstance', () => {
    it('should correctly get client instance and update last used time', () => {
      const { lastTimeUsed } = mockRedisClientInstance1;
      const result = service.getClientInstance(mockRedisClientInstance1.clientMetadata);

      expect(result).toEqual(service.clients.get(mockRedisClientInstance1.id));
      expect(service.clients.get(mockRedisClientInstance1.id).lastTimeUsed).toBeGreaterThan(lastTimeUsed);
    });
    it('should not fail when there is no client', () => {
      const result = service.getClientInstance({
        sessionMetadata: undefined,
        databaseId: 'invalid-instance-id',
        context: ClientContext.Common,
      });

      expect(result).toBeUndefined();
    });
  });

  describe('setClientInstance', () => {
    beforeEach(() => {
      service.clients = new Map();
    });

    it('should add new client', () => {
      expect(service.clients.size).toEqual(0);

      const result = service.setClientInstance(mockRedisClientInstance1.clientMetadata, mockIORedisClient);

      expect(result.client).toEqual(mockIORedisClient);
      expect(service.clients.size).toEqual(1);
    });

    it('should use existing client instead of replacing with new one', async () => {
      expect(service.clients.size).toEqual(0);

      expect(service.setClientInstance(mockRedisClientInstance1.clientMetadata, mockIORedisClient).client)
        .toEqual(mockIORedisClient);
      expect(service.clients.size).toEqual(1);

      let [justAddedClient] = [...service.clients.values()];
      justAddedClient = { ...justAddedClient };

      // sleep
      await new Promise((res) => setTimeout(res, 100));

      expect(service.setClientInstance(mockRedisClientInstance1.clientMetadata, mockIORedisSentinel).client)
        .toEqual(mockIORedisClient);
      expect(service.clients.size).toEqual(1);

      const [newClient] = [...service.clients.values()];
      expect(newClient.clientMetadata).toEqual(justAddedClient.clientMetadata);
      expect(newClient.id).toEqual(justAddedClient.id);
      expect(newClient.client).toEqual(justAddedClient.client);
      expect(newClient.lastTimeUsed).toBeGreaterThan(justAddedClient.lastTimeUsed);
    });
  });

  describe('removeClientInstance', () => {
    it('should remove only one', () => {
      const result = service.removeClientInstance(mockRedisClientInstance1.clientMetadata);

      expect(result).toEqual(1);
      expect(service.clients.size).toEqual(4);
      expect(service.clients.get(mockRedisClientInstance1.id)).toEqual(undefined);
    });
    it('should not fail in case when no client found', () => {
      const result = service.removeClientInstance({
        ...mockRedisClientInstance1.clientMetadata,
        db: 100,
      });

      expect(result).toEqual(0);
      expect(service.clients.size).toEqual(5);
    });
  });

  describe('findClientInstances + removeClientInstances', () => {
    it('should correctly find client instances for particular database', () => {
      const query = {
        databaseId: mockDatabase.id,
      };

      const result = service.findClientInstances(query);

      expect(result.length).toEqual(4);
      result.forEach((clientInstance) => {
        expect(clientInstance.clientMetadata.databaseId).toEqual(query.databaseId);
      });

      expect(service.removeClientInstances(query)).toEqual(4);
      expect(service.clients.size).toEqual(1);
    });
    it('should correctly find client instances for particular database and context', () => {
      const query = {
        databaseId: mockDatabase.id,
        context: ClientContext.Browser,
      };

      const result = service.findClientInstances(query);

      expect(result.length).toEqual(1);
      result.forEach((clientInstance) => {
        expect(clientInstance.clientMetadata.databaseId).toEqual(query.databaseId);
        expect(clientInstance.clientMetadata.context).toEqual(query.context);
      });

      expect(service.removeClientInstances(query)).toEqual(1);
      expect(service.clients.size).toEqual(4);
    });
    xit('should correctly find client instances for particular database and user', () => {
      const query = {
        sessionMetadata: { userId: 'u1' } as SessionMetadata,
        databaseId: mockDatabase.id,
      };

      const result = service.findClientInstances(query);

      expect(result.length).toEqual(2);
      result.forEach((clientInstance) => {
        expect(clientInstance.clientMetadata.databaseId).toEqual(query.databaseId);
        expect(clientInstance.clientMetadata.sessionMetadata.userId).toEqual(query.sessionMetadata.userId);
      });

      expect(service.removeClientInstances(query)).toEqual(2);
      expect(service.clients.size).toEqual(3);
    });
    xit('should correctly find client instances for particular user', () => {
      const query = {
        sessionMetadata: { userId: 'u2' } as SessionMetadata,
      };

      const result = service.findClientInstances(query);

      expect(result.length).toEqual(3);
      result.forEach((clientInstance) => {
        expect(clientInstance.clientMetadata.sessionMetadata.userId).toEqual(query.sessionMetadata.userId);
      });
      expect(result[0].clientMetadata.databaseId).toEqual(mockDatabase.id);
      expect(result[2].clientMetadata.databaseId).toEqual('d2');

      expect(service.removeClientInstances(query)).toEqual(3);
      expect(service.clients.size).toEqual(2);
    });
    it('should correctly find client instances for particular database and db index', () => {
      const query = {
        databaseId: mockDatabase.id,
        db: 0,
      };

      const result = service.findClientInstances(query);

      expect(result.length).toEqual(1);
      result.forEach((clientInstance) => {
        expect(clientInstance.clientMetadata.databaseId).toEqual(query.databaseId);
        expect(clientInstance.clientMetadata.context).toEqual(ClientContext.Browser);
        expect(clientInstance.clientMetadata.db).toEqual(query.db);
      });

      expect(service.removeClientInstances(query)).toEqual(1);
      expect(service.clients.size).toEqual(4);
    });
    it('should not find any instances', () => {
      const query = {
        databaseId: 'not existing',
      };

      const result = service.findClientInstances(query);

      expect(result).toEqual([]);

      expect(service.removeClientInstances(query)).toEqual(0);
      expect(service.clients.size).toEqual(5);
    });
  });

  describe('isClientConnected', () => {
    it('should return true', async () => {
      const result = service.isClientConnected(mockIORedisClient);

      expect(result).toEqual(true);
    });
    it('should return false', async () => {
      const mockClient = { ...mockIORedisClient };
      mockClient.status = 'end';

      const result = service.isClientConnected(mockClient);

      expect(result).toEqual(false);
    });
    it('should return false in case of an error', async () => {
      const result = service.isClientConnected(undefined);

      expect(result).toEqual(false);
    });
  });
});
