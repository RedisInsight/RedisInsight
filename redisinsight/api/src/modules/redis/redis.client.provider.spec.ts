import { Test, TestingModule } from '@nestjs/testing';
import {
  generateMockRedisClient,
  mockDatabase,
  mockRedisConnectionFactory,
} from 'src/__mocks__';
import { ClientContext, SessionMetadata } from 'src/common/models';
import { RedisConnectionFactory } from 'src/modules/redis/redis-connection.factory';
import { RedisClientProvider } from 'src/modules/redis/redis.client.provider';
import apiConfig from 'src/utils/config';

const REDIS_CLIENTS_CONFIG = apiConfig.get('redis_clients');

describe('RedisClientProvider', () => {
  let service: RedisClientProvider;
  const mockClientMetadata1 = {
    sessionMetadata: {
      userId: 'u1',
      sessionId: 's1',
    },
    databaseId: mockDatabase.id,
    context: ClientContext.Common,
  };

  const mockRedisClient1 = generateMockRedisClient(mockClientMetadata1);
  const mockRedisClient2 = generateMockRedisClient({
    ...mockClientMetadata1,
    context: ClientContext.Browser,
    db: 0,
  });
  const mockRedisClient3 = generateMockRedisClient({
    ...mockClientMetadata1,
    sessionMetadata: { userId: 'u2', sessionId: 's2' },
    context: ClientContext.Workbench,
    db: 1,
  });
  const mockRedisClient4 = generateMockRedisClient({
    ...mockClientMetadata1,
    sessionMetadata: { userId: 'u2', sessionId: 's3' },
    db: 2,
  });
  const mockRedisClient5 = generateMockRedisClient({
    ...mockClientMetadata1,
    databaseId: 'd2',
    sessionMetadata: { userId: 'u2', sessionId: 's4' },
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisClientProvider,
        {
          provide: RedisConnectionFactory,
          useFactory: mockRedisConnectionFactory,
        },
      ],
    }).compile();

    service = await module.get(RedisClientProvider);

    service['clients'].set(mockRedisClient1.id, mockRedisClient1);
    service['clients'].set(mockRedisClient2.id, mockRedisClient2);
    service['clients'].set(mockRedisClient3.id, mockRedisClient3);
    service['clients'].set(mockRedisClient4.id, mockRedisClient4);
    service['clients'].set(mockRedisClient5.id, mockRedisClient5);
  });

  afterEach(() => {
    service.onModuleDestroy();
  });

  describe('syncClients', () => {
    it('should not remove any client since no idle time passed', async () => {
      expect(service['clients'].size).toEqual(5);

      service['syncClients']();

      expect(service['clients'].size).toEqual(5);
    });

    it('should remove client with exceeded time in idle', async () => {
      expect(service['clients'].size).toEqual(5);
      const toDelete = service['clients'].get(mockRedisClient1.id);
      toDelete['lastTimeUsed'] = Date.now() - REDIS_CLIENTS_CONFIG.maxIdleThreshold - 1;

      service['syncClients']();

      expect(service['clients'].size).toEqual(4);
      expect(service['clients'].get(mockRedisClient1.id)).toEqual(undefined);
    });
    // todo: should not fail
  });

  describe('getClient', () => {
    it('should correctly get client instance and update last used time', async () => {
      // eslint-disable-next-line prefer-destructuring
      const lastTimeUsed = mockRedisClient1['lastTimeUsed'];

      const result = await service.getClient(mockRedisClient1.id);

      expect(result).toEqual(service['clients'].get(mockRedisClient1.id));
      expect(result['lastTimeUsed']).toBeGreaterThan(lastTimeUsed);
    });
    it('should not fail when there is no client', async () => {
      const result = await service.getClient('not-existing');

      expect(result).toBeUndefined();
    });
  });

  describe('getClientByMetadata', () => {
    it('should correctly get client instance and update last used time', async () => {
      // eslint-disable-next-line prefer-destructuring
      const lastTimeUsed = mockRedisClient1['lastTimeUsed'];

      const result = await service.getClientByMetadata(mockRedisClient1['clientMetadata']);

      expect(result).toEqual(service['clients'].get(mockRedisClient1.id));
      expect(result['lastTimeUsed']).toBeGreaterThan(lastTimeUsed);
    });
    it('should not fail when there is no client', async () => {
      const result = await service.getClientByMetadata({
        sessionMetadata: undefined,
        databaseId: 'invalid-instance-id',
        context: ClientContext.Common,
      });

      expect(result).toBeUndefined();
    });
    // todo: test for process client metadata
  });

  describe('setClient', () => {
    beforeEach(() => {
      // @ts-ignore
      service['clients'] = new Map();
    });

    it('should add new client', async () => {
      expect(service['clients'].size).toEqual(0);

      const result = await service.setClient(mockRedisClient1);

      expect(result).toEqual(mockRedisClient1);
      expect(service['clients'].size).toEqual(1);
      expect(await service.getClient(mockRedisClient1.id)).toEqual(mockRedisClient1);
    });

    it('should use existing client instead of replacing with new one', async () => {
      const existingClient = generateMockRedisClient(mockClientMetadata1);

      expect(service['clients'].size).toEqual(0);
      expect(await service.setClient(existingClient)).toEqual(existingClient);
      expect(service['clients'].size).toEqual(1);

      // sleep
      await new Promise((res) => setTimeout(res, 100));

      const newClient = generateMockRedisClient(mockClientMetadata1);
      const result = await service.setClient(newClient);
      expect(result).toEqual(existingClient);
      expect(result).not.toEqual(newClient);
      expect(service['clients'].size).toEqual(1);

      expect(newClient.disconnect).toHaveBeenCalledTimes(1);
      expect(existingClient.disconnect).not.toHaveBeenCalled();

      expect(newClient.id).toEqual(existingClient.id);
    });

    it('should use new client when there is existing client but without active connection', async () => {
      const existingClient = generateMockRedisClient(mockClientMetadata1);
      existingClient.isConnected.mockReturnValue(false);

      expect(service['clients'].size).toEqual(0);
      expect(await service.setClient(existingClient)).toEqual(existingClient);
      expect(service['clients'].size).toEqual(1);

      // sleep
      await new Promise((res) => setTimeout(res, 100));

      const newClient = generateMockRedisClient(mockClientMetadata1);
      const result = await service.setClient(newClient);
      expect(result).toEqual(newClient);
      expect(result).not.toEqual(existingClient);
      expect(service['clients'].size).toEqual(1);

      expect(existingClient.disconnect).toHaveBeenCalledTimes(1);
      expect(newClient.disconnect).not.toHaveBeenCalled();

      expect(newClient.id).toEqual(existingClient.id);
    });
  });

  describe('removeClient', () => {
    it('should remove only one', async () => {
      const result = await service.removeClient(mockRedisClient1.id);

      expect(result).toEqual(1);
      expect(service['clients'].size).toEqual(4);
      expect(service['clients'].get(mockRedisClient1.id)).toEqual(undefined);
    });
    it('should not fail in case when no client found', async () => {
      const result = await service.removeClient('not-existing');

      expect(result).toEqual(0);
      expect(service['clients'].size).toEqual(5);
    });
    it('should not fail in case when client.disconnect() failed and remove client from the pool', async () => {
      mockRedisClient1.disconnect.mockRejectedValueOnce(new Error('Can\'t disconnect.'));
      const result = await service.removeClient(mockRedisClient1.id);

      expect(result).toEqual(1);
      expect(service['clients'].size).toEqual(4);
    });
  });

  describe('removeClientByMetadata', () => {
    it('should remove only one', async () => {
      const result = await service.removeClientByMetadata(mockRedisClient1['clientMetadata']);

      expect(result).toEqual(1);
      expect(service['clients'].size).toEqual(4);
      expect(service['clients'].get(mockRedisClient1.id)).toEqual(undefined);
    });
    it('should not fail in case when no client found', async () => {
      const result = await service.removeClientByMetadata({
        ...mockRedisClient1['clientMetadata'],
        databaseId: 'not-existing',
      });

      expect(result).toEqual(0);
      expect(service['clients'].size).toEqual(5);
    });
    // todo: add prepareMetadata check test
  });

  describe('findClients + removeClientsByMetadata', () => {
    it('should correctly find clients for particular database', async () => {
      const query = {
        databaseId: mockClientMetadata1.databaseId,
      };

      const result = service['findClients'](query);

      expect(result.length).toEqual(4);
      result.forEach((id) => {
        expect(service['clients'].get(id)['clientMetadata'].databaseId).toEqual(query.databaseId);
      });

      expect(await service.removeClientsByMetadata(query)).toEqual(4);
      expect(service['clients'].size).toEqual(1);
    });
    it('should correctly find clients for particular database and context', async () => {
      const query = {
        databaseId: mockClientMetadata1.databaseId,
        context: ClientContext.Browser,
      };

      const result = service['findClients'](query);

      expect(result.length).toEqual(1);
      result.forEach((id) => {
        expect(service['clients'].get(id)['clientMetadata'].databaseId).toEqual(query.databaseId);
        expect(service['clients'].get(id)['clientMetadata'].context).toEqual(query.context);
      });

      expect(await service.removeClientsByMetadata(query)).toEqual(1);
      expect(service['clients'].size).toEqual(4);
    });
    it('should correctly find clients for particular database and user', async () => {
      const query = {
        sessionMetadata: { userId: 'u1' } as SessionMetadata,
        databaseId: mockDatabase.id,
      };

      const result = service['findClients'](query);

      expect(result.length).toEqual(2);
      result.forEach((id) => {
        expect(service['clients'].get(id)['clientMetadata'].databaseId).toEqual(query.databaseId);
        expect(service['clients'].get(id)['clientMetadata'].sessionMetadata.userId)
          .toEqual(query.sessionMetadata.userId);
      });

      expect(await service.removeClientsByMetadata(query)).toEqual(2);
      expect(service['clients'].size).toEqual(3);
    });
    it('should correctly find clients for particular user', async () => {
      const query = {
        sessionMetadata: { userId: 'u2' } as SessionMetadata,
      };

      const result = service['findClients'](query);

      expect(result.length).toEqual(3);
      result.forEach((id) => {
        expect(service['clients'].get(id)['clientMetadata'].sessionMetadata.userId)
          .toEqual(query.sessionMetadata.userId);
      });
      expect(service['clients'].get(result[0])['clientMetadata'].databaseId).toEqual(mockDatabase.id);
      expect(service['clients'].get(result[2])['clientMetadata'].databaseId).toEqual('d2');

      expect(await service.removeClientsByMetadata(query)).toEqual(3);
      expect(service['clients'].size).toEqual(2);
    });
    it('should correctly find clients for particular database and db index', async () => {
      const query = {
        databaseId: mockDatabase.id,
        db: 0,
      };

      const result = service['findClients'](query);

      expect(result.length).toEqual(1);
      result.forEach((id) => {
        expect(service['clients'].get(id)['clientMetadata'].databaseId).toEqual(query.databaseId);
        expect(service['clients'].get(id)['clientMetadata'].db).toEqual(query.db);
      });

      expect(await service.removeClientsByMetadata(query)).toEqual(1);
      expect(service['clients'].size).toEqual(4);
    });
    it('should not find any instances', async () => {
      const query = {
        databaseId: 'not existing',
      };

      const result = service['findClients'](query);

      expect(result).toEqual([]);

      expect(await service.removeClientsByMetadata(query)).toEqual(0);
      expect(service['clients'].size).toEqual(5);
    });
    // todo: should not fail
  });

  // describe('isClientConnected', () => {
  //   it('should return true', async () => {
  //     const result = service.isClientConnected(mockIORedisClient);
  //
  //     expect(result).toEqual(true);
  //   });
  //   it('should return false', async () => {
  //     const mockClient = { ...mockIORedisClient };
  //     mockClient.status = 'end';
  //
  //     const result = service.isClientConnected(mockClient);
  //
  //     expect(result).toEqual(false);
  //   });
  //   it('should return false in case of an error', async () => {
  //     const result = service.isClientConnected(undefined);
  //
  //     expect(result).toEqual(false);
  //   });
  // });
});
