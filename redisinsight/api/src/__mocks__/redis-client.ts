import { IRedisClientInstance, RedisService } from 'src/modules/redis/redis.service';
import { mockCommonClientMetadata } from 'src/__mocks__/common';
import { mockIORedisClient } from 'src/__mocks__/redis';
import { ClientMetadata } from 'src/common/models';

export const mockRedisClientInstance: IRedisClientInstance = {
  id: RedisService.generateId(mockCommonClientMetadata),
  clientMetadata: mockCommonClientMetadata,
  client: mockIORedisClient,
  lastTimeUsed: 1619791508019,
};

export const generateMockRedisClientInstance = (clientMetadata: Partial<ClientMetadata>): IRedisClientInstance => ({
  id: RedisService.generateId(clientMetadata as ClientMetadata),
  clientMetadata: clientMetadata as ClientMetadata,
  client: mockIORedisClient,
  lastTimeUsed: Date.now(),
});
