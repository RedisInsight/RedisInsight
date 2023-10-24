import { IRedisClientInstance, RedisService } from 'src/modules/redis/redis.service';
import { mockCommonClientMetadata } from 'src/__mocks__/common';
import { mockIORedisClient } from 'src/__mocks__/redis';
import { ClientMetadata } from 'src/common/models';
import { RedisClient, RedisClientConnectionType } from 'src/modules/redis/client';

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

// todo: NEW. remove everything above
export class MockRedisClient extends RedisClient {
  constructor(clientMetadata: ClientMetadata, client: any = jest.fn()) {
    super(clientMetadata, client);
  }

  public isConnected = jest.fn().mockReturnValue(true);

  public getConnectionType = jest.fn().mockReturnValue(RedisClientConnectionType.STANDALONE);

  public nodes = jest.fn().mockResolvedValue([this]);

  public sendCommand = jest.fn().mockResolvedValue(undefined);

  public sendPipeline = jest.fn().mockResolvedValue(undefined);

  // public sendMulti = jest.fn().mockResolvedValue(undefined);

  public call = jest.fn().mockResolvedValue(undefined);

  public disconnect = jest.fn().mockResolvedValue(undefined);

  public quit = jest.fn().mockResolvedValue(undefined); // todo: should return commands results
}

export const mockStandaloneRedisClient = new MockRedisClient(mockCommonClientMetadata);
export const mockClusterRedisClient = new MockRedisClient(mockCommonClientMetadata);
export const mockSentinelClient = new MockRedisClient(mockCommonClientMetadata);

export const generateMockRedisClient = (
  clientMetadata: Partial<ClientMetadata>,
  client = jest.fn(),
): MockRedisClient => new MockRedisClient(clientMetadata as ClientMetadata, client);

export const mockRedisClientStorage = jest.fn(() => ({
  get: jest.fn().mockResolvedValue(mockStandaloneRedisClient),
  getByMetadata: jest.fn().mockResolvedValue(mockStandaloneRedisClient),
  set: jest.fn().mockResolvedValue(mockStandaloneRedisClient),
  remove: jest.fn().mockResolvedValue(1),
  removeByMetadata: jest.fn().mockResolvedValue(1),
  removeManyByMetadata: jest.fn().mockResolvedValue(1),
}));

export const mockRedisConnectionStrategy = jest.fn(() => ({
  createStandaloneClient: jest.fn().mockResolvedValue(mockStandaloneRedisClient),
  createClusterClient: jest.fn().mockResolvedValue(mockClusterRedisClient),
  createSentinelClient: jest.fn().mockResolvedValue(mockSentinelClient),
}));
