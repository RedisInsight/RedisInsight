import { Test, TestingModule } from '@nestjs/testing';
import * as Redis from 'ioredis';
import {
  mockLogFile, mockRedisShardObserver, mockSocket, mockStandaloneDatabaseEntity,
  MockType
} from 'src/__mocks__';
import { InstancesBusinessService } from 'src/modules/shared/services/instances-business/instances-business.service';
import { RedisObserverProvider } from 'src/modules/profiler/providers/redis-observer.provider';
import { IFindRedisClientInstanceByOptions, RedisService } from 'src/modules/core/services/redis/redis.service';
import { mockRedisClientInstance } from 'src/modules/shared/services/base/redis-consumer.abstract.service.spec';
import { RedisObserverStatus } from 'src/modules/profiler/constants';
import { PubSubService } from 'src/modules/pub-sub/pub-sub.service';
import { UserSessionProvider } from 'src/modules/pub-sub/providers/user-session.provider';
import { SubscriptionProvider } from 'src/modules/pub-sub/providers/subscription.provider';
import { UserClient } from 'src/modules/pub-sub/model/user-client';
import { SubscriptionType } from 'src/modules/pub-sub/constants';
import { RedisClientProvider } from 'src/modules/pub-sub/providers/redis-client.provider';
import { UserSession } from 'src/modules/pub-sub/model/user-session';
import { RedisClient } from 'src/modules/pub-sub/model/redis-client';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

const nodeClient = Object.create(Redis.prototype);
nodeClient.subscribe = jest.fn();
nodeClient.psubscribe = jest.fn();
nodeClient.unsubscribe = jest.fn();
nodeClient.punsubscribe = jest.fn();
nodeClient.status = 'ready';
nodeClient.disconnect = jest.fn();
nodeClient.publish = jest.fn();

const mockUserClient = new UserClient('socketId', mockSocket, 'databaseId');

const mockSubscriptionDto = {
  channel: 'channel-a',
  type: SubscriptionType.Subscribe,
};

const mockPSubscriptionDto = {
  channel: 'channel-a',
  type: SubscriptionType.PSubscribe,
};

const getRedisClientFn = jest.fn();
const mockRedisClient = new RedisClient('databaseId', getRedisClientFn);
const mockUserSession = new UserSession(mockUserClient, mockRedisClient);

const mockSubscribe = jest.fn();
const mockUnsubscribe = jest.fn();
mockUserSession['subscribe'] = mockSubscribe;
mockUserSession['unsubscribe'] = mockUnsubscribe;
mockUserSession['destroy'] = jest.fn();

const mockClientOptions: IFindRedisClientInstanceByOptions = {
  instanceId: mockStandaloneDatabaseEntity.id,
};

const mockPublishDto = {
  message: 'message-a',
  channel: 'channel-a',
};

describe('PubSubService', () => {
  let service: PubSubService;
  let sessionProvider: MockType<UserSessionProvider>;
  let redisService: MockType<RedisService>;
  let databaseService: MockType<InstancesBusinessService>;

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PubSubService,
        UserSessionProvider,
        SubscriptionProvider,
        {
          provide: UserSessionProvider,
          useFactory: () => ({
            getOrCreateUserSession: jest.fn(),
            getUserSession: jest.fn(),
            removeUserSession: jest.fn(),
          }),
        },
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

    service = await module.get(PubSubService);
    redisService = await module.get(RedisService);
    databaseService = await module.get(InstancesBusinessService);
    sessionProvider = await module.get(UserSessionProvider);

    getRedisClientFn.mockResolvedValue(nodeClient);
    sessionProvider.getOrCreateUserSession.mockReturnValue(mockUserSession);
    sessionProvider.getUserSession.mockReturnValue(mockUserSession);
    sessionProvider.removeUserSession.mockReturnValue(undefined);
    mockSubscribe.mockResolvedValue('OK');
    mockUnsubscribe.mockResolvedValue('OK');
    redisService.getClientInstance.mockReturnValue({ ...mockRedisClientInstance, client: nodeClient });
    redisService.isClientConnected.mockReturnValue(true);
    databaseService.connectToInstance.mockResolvedValue(nodeClient);
    nodeClient.publish.mockResolvedValue(2);
  });

  describe('subscribe', () => {
    it('should subscribe to a single channel', async () => {
      await service.subscribe(mockUserClient, { subscriptions: [mockSubscriptionDto] });
      expect(mockUserSession.subscribe).toHaveBeenCalledTimes(1);
    });
    it('should subscribe to a multiple channels', async () => {
      await service.subscribe(mockUserClient, { subscriptions: [mockSubscriptionDto, mockPSubscriptionDto] });
      expect(mockUserSession.subscribe).toHaveBeenCalledTimes(2);
    });
    it('should handle HTTP error', async () => {
      try {
        mockSubscribe.mockRejectedValueOnce(new NotFoundException('Not Found'));
        await service.subscribe(mockUserClient, { subscriptions: [mockSubscriptionDto] });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });
    it('should handle acl error', async () => {
      try {
        mockSubscribe.mockRejectedValueOnce(new Error('NOPERM'));
        await service.subscribe(mockUserClient, { subscriptions: [mockSubscriptionDto] });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(ForbiddenException);
      }
    });
  });

  describe('unsubscribe', () => {
    it('should unsubscribe from a single channel', async () => {
      await service.unsubscribe(mockUserClient, { subscriptions: [mockSubscriptionDto] });
      expect(mockUserSession.unsubscribe).toHaveBeenCalledTimes(1);
    });
    it('should unsubscribe from multiple channels', async () => {
      await service.unsubscribe(mockUserClient, { subscriptions: [mockSubscriptionDto, mockPSubscriptionDto] });
      expect(mockUserSession.unsubscribe).toHaveBeenCalledTimes(2);
    });
    it('should handle HTTP error', async () => {
      try {
        mockUnsubscribe.mockRejectedValueOnce(new NotFoundException('Not Found'));
        await service.unsubscribe(mockUserClient, { subscriptions: [mockSubscriptionDto] });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });
    it('should handle acl error', async () => {
      try {
        mockUnsubscribe.mockRejectedValueOnce(new Error('NOPERM'));
        await service.unsubscribe(mockUserClient, { subscriptions: [mockSubscriptionDto] });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(ForbiddenException);
      }
    });
  });

  describe('publish', () => {
    it('should publish using existing client', async () => {
      const res = await service.publish(mockClientOptions, mockPublishDto);
      expect(res).toEqual({ affected: 2 });
    });
    it('should publish using new client', async () => {
      redisService.isClientConnected.mockReturnValueOnce(false);
      const res = await service.publish(mockClientOptions, mockPublishDto);
      expect(res).toEqual({ affected: 2 });
    });
    it('should handle HTTP error', async () => {
      try {
        redisService.getClientInstance.mockImplementation(() => {
          throw new NotFoundException('Not Found');
        });

        await service.publish(mockClientOptions, mockPublishDto);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });
    it('should handle acl error', async () => {
      try {
        redisService.getClientInstance.mockImplementation(() => {
          throw new Error('NOPERM');
        });

        await service.publish(mockClientOptions, mockPublishDto);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(ForbiddenException);
      }
    });
  });

  describe('handleDisconnect', () => {
    it('should not do anything if no sessions', async () => {
      sessionProvider.getUserSession.mockReturnValueOnce(undefined);
      await service.handleDisconnect(mockUserClient.getId());
      expect(sessionProvider.removeUserSession).toHaveBeenCalledTimes(0);
    });
    it('should call session.destroy and remove session', async () => {
      await service.handleDisconnect(mockUserClient.getId());
      expect(sessionProvider.removeUserSession).toHaveBeenCalledTimes(1);
      expect(mockUserSession.destroy).toHaveBeenCalledTimes(1);
    });
  });
});
