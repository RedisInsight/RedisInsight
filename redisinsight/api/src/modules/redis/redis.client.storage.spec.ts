import { Test, TestingModule } from '@nestjs/testing';
import { generateMockRedisClient, mockDatabase } from 'src/__mocks__';
import { ClientContext, SessionMetadata } from 'src/common/models';
import { RedisClientStorage } from 'src/modules/redis/redis.client.storage';
import apiConfig from 'src/utils/config';
import { BadRequestException } from '@nestjs/common';
import { RedisClient } from 'src/modules/redis/client';

const REDIS_CLIENTS_CONFIG = apiConfig.get('redis_clients');

describe('RedisClientStorage', () => {
  let service: RedisClientStorage;
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
        RedisClientStorage,
      ],
    }).compile();

    service = await module.get(RedisClientStorage);

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
    it('should remove client with exceeded time in idle and not fail in case of error', async () => {
      expect(service['clients'].size).toEqual(5);
      const toDelete = service['clients'].get(mockRedisClient1.id);
      toDelete['lastTimeUsed'] = Date.now() - REDIS_CLIENTS_CONFIG.maxIdleThreshold - 1;
      mockRedisClient1.disconnect.mockRejectedValueOnce(new Error('some error'));

      service['syncClients']();

      expect(service['clients'].size).toEqual(4);
      expect(service['clients'].get(mockRedisClient1.id)).toEqual(undefined);
    });
  });

  describe('get', () => {
    it('should correctly get client instance and update last used time', async () => {
      // eslint-disable-next-line prefer-destructuring
      const lastTimeUsed = mockRedisClient1['lastTimeUsed'];

      const result = await service.get(mockRedisClient1.id);

      expect(result).toEqual(service['clients'].get(mockRedisClient1.id));
      expect(result['lastTimeUsed']).toBeGreaterThan(lastTimeUsed);
    });
    it('should return null when client is is disconnected and client will be removed', async () => {
      expect(service['clients'].get(mockRedisClient1.id)).not.toEqual(undefined);
      mockRedisClient1.isConnected.mockReturnValueOnce(false);

      const result = await service.get(mockRedisClient1.id);

      expect(result).toEqual(null);
      expect(service['clients'].get(mockRedisClient1.id)).toEqual(undefined);
    });
    it('should not fail when there is no client', async () => {
      const result = await service.get('not-existing');

      expect(result).toBeUndefined();
    });
  });

  describe('getByMetadata', () => {
    it('should correctly get client instance and update last used time', async () => {
      // eslint-disable-next-line prefer-destructuring
      const lastTimeUsed = mockRedisClient1['lastTimeUsed'];

      const result = await service.getByMetadata(mockRedisClient1['clientMetadata']);

      expect(result).toEqual(service['clients'].get(mockRedisClient1.id));
      expect(result['lastTimeUsed']).toBeGreaterThan(lastTimeUsed);
    });
    it('should find client for CLI ignoring db parameter', async () => {
      const mockClientMetadata = {
        ...mockClientMetadata1,
        db: 3,
        context: ClientContext.CLI,
        uniqueId: 'some-unique-id',
      };

      const mockClient = generateMockRedisClient(mockClientMetadata);
      service['clients'].set(mockClient.id, mockClient);

      const result1 = await service.getByMetadata(mockClientMetadata);
      expect(result1).toEqual(service['clients'].get(mockClient.id));

      const result2 = await service.getByMetadata({
        ...mockClientMetadata,
        db: 1,
      });
      expect(result2).toEqual(service['clients'].get(mockClient.id));
      expect(result2).toEqual(result1);

      const result3 = await service.getByMetadata({
        ...mockClientMetadata,
        db: 0,
      });
      expect(result3).toEqual(service['clients'].get(mockClient.id));
      expect(result3).toEqual(result2);
    });
    it('should not fail when there is no client', async () => {
      const result = await service.getByMetadata({
        sessionMetadata: undefined,
        databaseId: 'invalid-instance-id',
        context: ClientContext.Common,
      });

      expect(result).toBeUndefined();
    });
  });

  describe('set', () => {
    beforeEach(() => {
      // @ts-ignore
      service['clients'] = new Map();
    });

    it('should add new client', async () => {
      expect(service['clients'].size).toEqual(0);

      const result = await service.set(mockRedisClient1);

      expect(result).toEqual(mockRedisClient1);
      expect(service['clients'].size).toEqual(1);
      expect(await service.get(mockRedisClient1.id)).toEqual(mockRedisClient1);
    });

    it('should use existing client instead of replacing with new one', async () => {
      const existingClient = generateMockRedisClient(mockClientMetadata1);

      expect(service['clients'].size).toEqual(0);
      expect(await service.set(existingClient)).toEqual(existingClient);
      expect(service['clients'].size).toEqual(1);

      // sleep
      await new Promise((res) => setTimeout(res, 100));

      const newClient = generateMockRedisClient(mockClientMetadata1);
      const result = await service.set(newClient);
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
      expect(await service.set(existingClient)).toEqual(existingClient);
      expect(service['clients'].size).toEqual(1);

      // sleep
      await new Promise((res) => setTimeout(res, 100));

      const newClient = generateMockRedisClient(mockClientMetadata1);
      const result = await service.set(newClient);
      expect(result).toEqual(newClient);
      expect(result).not.toEqual(existingClient);
      expect(service['clients'].size).toEqual(1);

      expect(existingClient.disconnect).toHaveBeenCalledTimes(1);
      expect(newClient.disconnect).not.toHaveBeenCalled();

      expect(newClient.id).toEqual(existingClient.id);
    });

    it('should throw and error if clientMetadata has not required fields', async () => {
      await expect(service.set(generateMockRedisClient({}))).rejects.toThrow(BadRequestException);
      await expect(service.set(generateMockRedisClient({
        databaseId: '1',
      }))).rejects.toThrow(BadRequestException);
      await expect(service.set(generateMockRedisClient({
        databaseId: '1',
        context: ClientContext.Common,
      }))).rejects.toThrow(BadRequestException);
      await expect(service.set(generateMockRedisClient({
        databaseId: '1',
        context: ClientContext.Common,
        sessionMetadata: {
          userId: '1',
        } as SessionMetadata,
      }))).rejects.toThrow(BadRequestException);
      await expect(service.set(generateMockRedisClient({
        databaseId: '1',
        context: ClientContext.Common,
        sessionMetadata: {
          userId: '1',
          sessionId: '1',
        } as SessionMetadata,
      }))).resolves.toBeInstanceOf(RedisClient);
    });
  });

  describe('remove', () => {
    it('should remove only one', async () => {
      const result = await service.remove(mockRedisClient1.id);

      expect(result).toEqual(1);
      expect(service['clients'].size).toEqual(4);
      expect(service['clients'].get(mockRedisClient1.id)).toEqual(undefined);
    });
    it('should not fail in case when no client found', async () => {
      const result = await service.remove('not-existing');

      expect(result).toEqual(0);
      expect(service['clients'].size).toEqual(5);
    });
    it('should not fail in case when client.disconnect() failed and remove client from the pool', async () => {
      mockRedisClient1.disconnect.mockRejectedValueOnce(new Error('Can\'t disconnect.'));
      const result = await service.remove(mockRedisClient1.id);

      expect(result).toEqual(1);
      expect(service['clients'].size).toEqual(4);
    });
  });

  describe('removeByMetadata', () => {
    it('should remove only one', async () => {
      const result = await service.removeByMetadata(mockRedisClient1['clientMetadata']);

      expect(result).toEqual(1);
      expect(service['clients'].size).toEqual(4);
      expect(service['clients'].get(mockRedisClient1.id)).toEqual(undefined);
    });
    it('should not fail in case when no client found', async () => {
      const result = await service.removeByMetadata({
        ...mockRedisClient1['clientMetadata'],
        databaseId: 'not-existing',
      });

      expect(result).toEqual(0);
      expect(service['clients'].size).toEqual(5);
    });
    // todo: add prepareMetadata check test
  });

  describe('findClients + removeManyByMetadata', () => {
    it('should correctly find clients for particular database', async () => {
      const query = {
        databaseId: mockClientMetadata1.databaseId,
      };

      const result = service['findClients'](query);

      expect(result.length).toEqual(4);
      result.forEach((id) => {
        expect(service['clients'].get(id)['clientMetadata'].databaseId).toEqual(query.databaseId);
      });

      expect(await service.removeManyByMetadata(query)).toEqual(4);
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

      expect(await service.removeManyByMetadata(query)).toEqual(1);
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

      expect(await service.removeManyByMetadata(query)).toEqual(2);
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

      expect(await service.removeManyByMetadata(query)).toEqual(3);
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

      expect(await service.removeManyByMetadata(query)).toEqual(1);
      expect(service['clients'].size).toEqual(4);
    });
    it('should not find any instances', async () => {
      const query = {
        databaseId: 'not existing',
      };

      const result = service['findClients'](query);

      expect(result).toEqual([]);

      expect(await service.removeManyByMetadata(query)).toEqual(0);
      expect(service['clients'].size).toEqual(5);
    });
  });
});
