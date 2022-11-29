import IORedis from 'ioredis';

const getRedisCommanderMockFunctions = () => ({
  sendCommand: jest.fn(),
  info: jest.fn(),
  monitor: jest.fn(),
  disconnect: jest.fn(),
  duplicate: jest.fn(),
  call: jest.fn(),
  subscribe: jest.fn(),
  psubscribe: jest.fn(),
  unsubscribe: jest.fn(),
  punsubscribe: jest.fn(),
  publish: jest.fn(),
  cluster: jest.fn(),
  quit: jest.fn(),
});

export const mockIORedisClient = {
  ...Object.create(IORedis.prototype),
  ...getRedisCommanderMockFunctions(),
  status: 'ready',
  options: {
    db: 0,
  },
};

export const mockIOClusterNode1 = {
  ...Object.create(IORedis.prototype),
  ...getRedisCommanderMockFunctions(),
  status: 'ready',
  options: {
    host: '127.0.100.1',
    port: 6379,
    db: 0,
  },
};

export const mockIOClusterNode2 = {
  ...Object.create(IORedis.prototype),
  ...getRedisCommanderMockFunctions(),
  status: 'ready',
  options: {
    host: '127.0.100.2',
    port: 6379,
    db: 0,
  },
};

export const mockIORedisSentinel = {
  ...Object.create(IORedis.prototype),
  ...getRedisCommanderMockFunctions(),
  status: 'ready',
  options: {
    db: 0,
  },
};

export const mockIORedisCluster = {
  ...Object.create(IORedis.Cluster.prototype),
  ...getRedisCommanderMockFunctions(),
  isCluster: true,
  status: 'ready',
  nodes: jest.fn().mockReturnValue([mockIOClusterNode1, mockIOClusterNode2]),
};

export const mockRedisService = jest.fn(() => ({
  getClientInstance: jest.fn().mockResolvedValue({
    client: mockIORedisClient,
  }),
  setClientInstance: jest.fn(),
  isClientConnected: jest.fn().mockReturnValue(true),
  connectToDatabaseInstance: jest.fn().mockResolvedValue(mockIORedisClient),
  createStandaloneClient: jest.fn().mockResolvedValue(mockIORedisClient),
  createSentinelClient: jest.fn().mockResolvedValue(mockIORedisSentinel),
  createClusterClient: jest.fn().mockResolvedValue(mockIORedisCluster),
  removeClientInstance: jest.fn(),
}));
