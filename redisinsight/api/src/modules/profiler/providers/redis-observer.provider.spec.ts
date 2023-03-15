import { Test, TestingModule } from '@nestjs/testing';
import {
  mockDatabaseConnectionService, mockIORedisClient,
  mockLogFile, mockRedisShardObserver,
} from 'src/__mocks__';
import { RedisObserverProvider } from 'src/modules/profiler/providers/redis-observer.provider';
import { RedisObserverStatus } from 'src/modules/profiler/constants';
import { DatabaseConnectionService } from 'src/modules/database/database-connection.service';

describe('RedisObserverProvider', () => {
  let service: RedisObserverProvider;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisObserverProvider,
        {
          provide: DatabaseConnectionService,
          useFactory: mockDatabaseConnectionService,
        },
      ],
    }).compile();

    service = await module.get(RedisObserverProvider);

    mockIORedisClient.call.mockResolvedValue('OK');
    mockIORedisClient.duplicate.mockReturnValue(mockIORedisClient);
    mockIORedisClient.monitor.mockReturnValue(mockRedisShardObserver);
  });

  it('getOrCreateObserver new observer', async () => {
    const redisObserver = await service.getOrCreateObserver(mockLogFile.instanceId);

    expect(redisObserver['redis']).toEqual(mockIORedisClient);
    expect(service['redisObservers'].size).toEqual(1);

    expect(await service.getObserver(mockLogFile.instanceId)).toEqual(redisObserver);
    await service.removeObserver(mockLogFile.instanceId);
    expect(service['redisObservers'].size).toEqual(0);
  });

  it('getOrCreateObserver check statuses', async () => {
    const redisObserver = await service.getOrCreateObserver(
      mockLogFile.instanceId,
    );

    redisObserver['init'] = jest.fn().mockResolvedValue(Promise.resolve());
    expect(redisObserver['redis']).toEqual(mockIORedisClient);
    expect(redisObserver['status']).toEqual(RedisObserverStatus.Ready);

    const promise = service.getOrCreateObserver(mockLogFile.instanceId);
    redisObserver.emit('connect');
    const redisObserver2 = await promise;
    expect(redisObserver).toEqual(redisObserver2);

    redisObserver['status'] = RedisObserverStatus.Ready;
    const redisObserver3 = await service.getOrCreateObserver(mockLogFile.instanceId);
    expect(redisObserver).toEqual(redisObserver3);

    redisObserver['status'] = RedisObserverStatus.Error;
    const promise2 = service.getOrCreateObserver(mockLogFile.instanceId);
    redisObserver.emit('connect');
    const redisObserver4 = await promise2;
    expect(redisObserver).toEqual(redisObserver4);

    try {
      redisObserver['status'] = RedisObserverStatus.Empty;
      const promise3 = service.getOrCreateObserver(mockLogFile.instanceId);
      redisObserver.emit('connect_error', new Error('error'));
      await promise3;
      fail();
    } catch (e) {
      expect(e.message).toEqual('error');
    }
  });
});
