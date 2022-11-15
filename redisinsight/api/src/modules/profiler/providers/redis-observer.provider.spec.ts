import { Test, TestingModule } from '@nestjs/testing';
import Redis from 'ioredis';
import {
  mockLogFile, mockRedisShardObserver,
  MockType,
} from 'src/__mocks__';
import { InstancesBusinessService } from 'src/modules/shared/services/instances-business/instances-business.service';
import { RedisObserverProvider } from 'src/modules/profiler/providers/redis-observer.provider';
import { RedisService } from 'src/modules/redis/redis.service';
import { mockRedisClientInstance } from 'src/modules/redis/redis-consumer.abstract.service.spec';
import { RedisObserverStatus } from 'src/modules/profiler/constants';

const nodeClient = Object.create(Redis.prototype);
nodeClient.monitor = jest.fn();
nodeClient.status = 'ready';
nodeClient.disconnect = jest.fn();
nodeClient.duplicate = jest.fn();
nodeClient.call = jest.fn();

describe('RedisObserverProvider', () => {
  let service: RedisObserverProvider;
  let redisService: MockType<RedisService>;
  let databaseService: MockType<InstancesBusinessService>;

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisObserverProvider,
        {
          provide: RedisService,
          useFactory: () => ({
            getClientInstance: jest.fn(),
            isClientConnected: jest.fn(),
          }),
        },
        {
          provide: InstancesBusinessService,
          useFactory: () => ({
            connectToInstance: jest.fn(),
            getOneById: jest.fn(),
          }),
        },
      ],
    }).compile();

    service = await module.get(RedisObserverProvider);
    redisService = await module.get(RedisService);
    databaseService = await module.get(InstancesBusinessService);

    redisService.getClientInstance.mockReturnValue({ ...mockRedisClientInstance, client: nodeClient });
    redisService.isClientConnected.mockReturnValue(true);
    databaseService.connectToInstance.mockResolvedValue(nodeClient);
    nodeClient.call.mockResolvedValue('OK');
    nodeClient.duplicate.mockReturnValue(nodeClient);
    nodeClient.monitor.mockReturnValue(mockRedisShardObserver);
  });

  it('getOrCreateObserver new observer get existing redis client', async () => {
    const redisObserver = await service.getOrCreateObserver(
      mockLogFile.instanceId,
    );

    expect(redisObserver['redis']).toEqual(nodeClient);
    expect(service['redisObservers'].size).toEqual(1);

    expect(await service.getObserver(mockLogFile.instanceId)).toEqual(redisObserver);
    await service.removeObserver(mockLogFile.instanceId);
    expect(service['redisObservers'].size).toEqual(0);
  });

  it('getOrCreateObserver new observer create new redis client ', async () => {
    redisService.isClientConnected.mockReturnValueOnce(false);

    const redisObserver = await service.getOrCreateObserver(
      mockLogFile.instanceId,
    );

    expect(redisObserver['redis']).not.toEqual(mockRedisClientInstance.client);
  });

  it('getOrCreateObserver check statuses', async () => {
    const redisObserver = await service.getOrCreateObserver(
      mockLogFile.instanceId,
    );

    redisObserver['init'] = jest.fn().mockResolvedValue(Promise.resolve());
    expect(redisObserver['redis']).toEqual(nodeClient);
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
