import { MockRedisClient } from 'src/__mocks__/redis-client';
import { mockBrowserClientMetadata } from 'src/__mocks__/common';

export const mockRedisClient = new MockRedisClient(mockBrowserClientMetadata);

export const mockDatabaseClientFactory = jest.fn(() => ({
  getOrCreateClient: jest.fn().mockResolvedValue(mockRedisClient),
  createClient: jest.fn().mockResolvedValue(mockRedisClient),
}));
