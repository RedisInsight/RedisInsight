import { Test, TestingModule } from '@nestjs/testing';
import { mockSocket } from 'src/__mocks__';
import { UserClient } from 'src/modules/pub-sub/model/user-client';
import { RedisClientProvider } from 'src/modules/pub-sub/providers/redis-client.provider';
import { RedisService } from 'src/modules/core/services/redis/redis.service';
import { InstancesBusinessService } from 'src/modules/shared/services/instances-business/instances-business.service';
import { RedisClient } from 'src/modules/pub-sub/model/redis-client';

const mockUserClient = new UserClient('socketId', mockSocket, 'databaseId');

describe('RedisClientProvider', () => {
  let service: RedisClientProvider;

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisClientProvider,
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

    service = await module.get(RedisClientProvider);
  });

  describe('createClient', () => {
    it('should create redis client', async () => {
      const redisClient = service.createClient(mockUserClient.getId());
      expect(redisClient).toBeInstanceOf(RedisClient);
    });
  });
});
