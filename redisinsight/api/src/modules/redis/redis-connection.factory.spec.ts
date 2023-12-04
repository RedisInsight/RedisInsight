import { Test, TestingModule } from '@nestjs/testing';
import * as Redis from 'ioredis';
import {
  mockClientMetadata, mockClusterDatabaseWithTlsAuth,
  mockDatabase,
  mockDatabaseWithTlsAuth,
  mockIORedisClient, mockIORedisCluster, mockIORedisSentinel,
  mockSentinelDatabaseWithTlsAuth, mockSshTunnelProvider,
} from 'src/__mocks__';
import { RedisConnectionFactory } from 'src/modules/redis/redis-connection.factory';
import { Database } from 'src/modules/database/models/database';
import { EventEmitter } from 'events';
import apiConfig from 'src/utils/config';
import { SshTunnelProvider } from 'src/modules/ssh/ssh-tunnel.provider';

const REDIS_CLIENTS_CONFIG = apiConfig.get('redis_clients');

jest.mock('ioredis', () => ({
  ...jest.requireActual('ioredis') as object,
}));

describe('RedisConnectionFactory', () => {
  let module: TestingModule;
  let service: RedisConnectionFactory;
  let mockClient;
  let mockCluster;
  let spyRedis;
  let spyCluster;
  const mockError = new Error('some error');
  const checkError = (cb) => (e) => {
    expect(e).toEqual(mockError);
    cb();
  };
  const checkClient = (cb, client) => (result) => {
    expect(result).toEqual(client);
    cb();
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        RedisConnectionFactory,
        {
          provide: SshTunnelProvider,
          useFactory: mockSshTunnelProvider,
        },
      ],
    })
      .compile();

    service = await module.get(RedisConnectionFactory);

    mockClient = new EventEmitter();
    mockCluster = new EventEmitter();
    spyRedis = jest.spyOn(Redis, 'default');
    spyRedis.mockImplementationOnce(() => mockClient);
    spyCluster = jest.spyOn(Redis, 'Cluster');
    spyCluster.mockImplementationOnce(() => mockCluster);
  });

  describe('retryStrategy', () => {
    it('should return 500ms delay for first retry', () => {
      expect(service['retryStrategy'](1)).toEqual(REDIS_CLIENTS_CONFIG.retryDelay);
    });
    it('should return 1000ms delay for second retry', () => {
      expect(service['retryStrategy'](2)).toEqual(REDIS_CLIENTS_CONFIG.retryDelay * 2);
    });
    it('should return undefined when number of retries exceeded', () => {
      expect(service['retryStrategy'](REDIS_CLIENTS_CONFIG.maxRetries + 1)).toEqual(undefined);
    });
  });

  describe('createStandaloneConnection', () => {
    it('should successfully create standalone client', (done) => {
      service.createStandaloneConnection(mockClientMetadata, mockDatabaseWithTlsAuth, { useRetry: true })
        .then(checkClient(done, mockClient));

      process.nextTick(() => {
        mockClient.emit('reconnecting');
        process.nextTick(() => mockClient.emit('ready'));
      });
    });

    it('should successfully create standalone client with reconnect', (done) => {
      service.createStandaloneConnection(mockClientMetadata, mockDatabaseWithTlsAuth, { useRetry: true })
        .then(checkClient(done, mockClient));
      process.nextTick(() => mockClient.emit('ready'));
    });

    it('should successfully create standalone client even with error event emited', (done) => {
      service.createStandaloneConnection(mockClientMetadata, mockDatabaseWithTlsAuth, { useRetry: true })
        .then(checkClient(done, mockClient));
      process.nextTick(() => mockClient.emit('error', mockError));
      process.nextTick(() => mockClient.emit('ready'));
    });

    it('should fail to create standalone with last error', (done) => {
      service.createStandaloneConnection(mockClientMetadata, mockDatabaseWithTlsAuth, {})
        .catch(checkError(done));

      process.nextTick(() => mockClient.emit('error', new Error('1')));
      process.nextTick(() => mockClient.emit('error', new Error('2')));
      process.nextTick(() => mockClient.emit('error', mockError));
      process.nextTick(() => mockClient.emit('end'));
    });

    it('should handle sync error during standalone client creation', (done) => {
      spyRedis.mockReset();
      spyRedis.mockImplementationOnce(() => {
        throw mockError;
      });

      service.createStandaloneConnection(mockClientMetadata, mockDatabaseWithTlsAuth, {})
        .catch(checkError(done));
    });
  });

  describe('createClusterConnection', () => {
    it('should successfully create cluster client', (done) => {
      service.createClusterConnection(mockClientMetadata, mockClusterDatabaseWithTlsAuth, {})
        .then(checkClient(done, mockCluster));

      process.nextTick(() => mockCluster.emit('ready'));
    });

    it('should successfully create cluster client and not fail even when error emited', (done) => {
      service.createClusterConnection(mockClientMetadata, mockClusterDatabaseWithTlsAuth, {})
        .then(checkClient(done, mockCluster));

      process.nextTick(() => mockCluster.emit('error', mockError));
      process.nextTick(() => mockCluster.emit('ready'));
    });

    it('should fail to create cluster connection with last error', (done) => {
      service.createClusterConnection(mockClientMetadata, mockClusterDatabaseWithTlsAuth, {})
        .catch(checkError(done));

      process.nextTick(() => mockCluster.emit('error', new Error('1')));
      process.nextTick(() => mockCluster.emit('error', new Error('2')));
      process.nextTick(() => mockCluster.emit('error', mockError));
      process.nextTick(() => mockCluster.emit('end'));
    });

    it('should handle sync error during cluster client creation', (done) => {
      spyCluster.mockReset();
      spyCluster.mockImplementationOnce(() => {
        throw mockError;
      });
      service.createClusterConnection(mockClientMetadata, mockClusterDatabaseWithTlsAuth, {})
        .catch(checkError(done));
    });
  });

  describe('createSentinelConnection', () => {
    it('should successfully create sentinel client', (done) => {
      service.createSentinelConnection(mockClientMetadata, mockSentinelDatabaseWithTlsAuth, { useRetry: true })
        .then(checkClient(done, mockClient));

      process.nextTick(() => mockClient.emit('ready'));
    });

    it('should successfully create sentinel client and not fail even when error emited', (done) => {
      service.createSentinelConnection(mockClientMetadata, mockSentinelDatabaseWithTlsAuth, { useRetry: true })
        .then(checkClient(done, mockClient));

      process.nextTick(() => mockClient.emit('error', mockError));
      process.nextTick(() => mockClient.emit('ready'));
    });

    it('should fail to create sentinel connection with last error', (done) => {
      service.createSentinelConnection(mockClientMetadata, mockSentinelDatabaseWithTlsAuth, {})
        .catch(checkError(done));

      process.nextTick(() => mockClient.emit('error', new Error('1')));
      process.nextTick(() => mockClient.emit('error', new Error('2')));
      process.nextTick(() => mockClient.emit('error', mockError));
      process.nextTick(() => mockClient.emit('end'));
    });

    it('should handle sync error during sentinel client creation', (done) => {
      spyRedis.mockReset();
      spyRedis.mockImplementationOnce(() => {
        throw mockError;
      });

      service.createSentinelConnection(mockClientMetadata, mockSentinelDatabaseWithTlsAuth, {})
        .catch(checkError(done));
    });
  });

  describe('createClientAutomatically', () => {
    beforeEach(() => {
      service.createSentinelConnection = jest.fn()
        .mockRejectedValueOnce(new Error());
      service.createClusterConnection = jest.fn()
        .mockRejectedValueOnce(new Error());
      service.createStandaloneConnection = jest.fn()
        .mockRejectedValueOnce(new Error());
    });
    it('should create standalone client', async () => {
      service.createStandaloneConnection = jest.fn()
        .mockResolvedValue(mockIORedisClient);

      const result = await service.createClientAutomatically(mockClientMetadata, mockDatabase);

      expect(result)
        .toEqual(mockIORedisClient);
      expect(service.createStandaloneConnection)
        .toHaveBeenCalledWith(mockClientMetadata, mockDatabase, { useRetry: true });
    });

    it('should create cluster client', async () => {
      service.createClusterConnection = jest.fn()
        .mockResolvedValue(mockIORedisCluster);

      const result = await service.createClientAutomatically(mockClientMetadata, mockClusterDatabaseWithTlsAuth);

      expect(result)
        .toEqual(mockIORedisCluster);
      expect(service.createClusterConnection)
        .toHaveBeenCalledWith(
          mockClientMetadata,
          mockClusterDatabaseWithTlsAuth,
          { useRetry: true },
        );
      expect(service.createStandaloneConnection)
        .not
        .toHaveBeenCalled();
    });

    it('should create sentinel client', async () => {
      service.createSentinelConnection = jest.fn()
        .mockResolvedValue(mockIORedisSentinel);

      const result = await service.createClientAutomatically(mockClientMetadata, mockSentinelDatabaseWithTlsAuth);

      expect(result)
        .toEqual(mockIORedisSentinel);
      expect(service.createSentinelConnection)
        .toHaveBeenCalledWith(
          mockClientMetadata,
          mockSentinelDatabaseWithTlsAuth,
          { useRetry: true },
        );
      expect(service.createClusterConnection)
        .not
        .toHaveBeenCalled();
      expect(service.createStandaloneConnection)
        .not
        .toHaveBeenCalled();
    });
  });

  describe('createRedisConnection', () => {
    it('should create standalone client', async () => {
      service.createStandaloneConnection = jest.fn()
        .mockResolvedValue(mockIORedisClient);

      const result = await service.createRedisConnection(mockClientMetadata, mockDatabase);

      expect(result)
        .toEqual(mockIORedisClient);
      expect(service.createStandaloneConnection)
        .toHaveBeenCalledWith(mockClientMetadata, mockDatabase, { useRetry: true });
    });

    it('should trigger auto discovery connection type (when no connectionType defined)', async () => {
      service.createClientAutomatically = jest.fn()
        .mockResolvedValue(mockIORedisClient);
      const mockDatabaseWithoutConnectionType = Object.assign(new Database(), {
        ...mockDatabase,
        connectionType: null,
      });

      const result = await service.createRedisConnection(mockClientMetadata, mockDatabaseWithoutConnectionType);

      expect(result)
        .toEqual(mockIORedisClient);
      expect(service.createClientAutomatically)
        .toHaveBeenCalledWith(
          mockClientMetadata,
          {
            ...mockDatabaseWithoutConnectionType,
            connectionType: undefined,
          },
          undefined,
        );
    });

    it('should create cluster client', async () => {
      service.createClusterConnection = jest.fn()
        .mockResolvedValue(mockIORedisCluster);

      const result = await service.createRedisConnection(mockClientMetadata, mockClusterDatabaseWithTlsAuth);

      expect(result)
        .toEqual(mockIORedisCluster);
      expect(service.createClusterConnection)
        .toHaveBeenCalledWith(
          mockClientMetadata,
          mockClusterDatabaseWithTlsAuth,
          { useRetry: true },
        );
    });

    it('should create sentinel client', async () => {
      service.createSentinelConnection = jest.fn()
        .mockResolvedValue(mockIORedisSentinel);

      const result = await service.createRedisConnection(mockClientMetadata, mockSentinelDatabaseWithTlsAuth);

      expect(result)
        .toEqual(mockIORedisSentinel);
      expect(service.createSentinelConnection)
        .toHaveBeenCalledWith(
          mockClientMetadata,
          mockSentinelDatabaseWithTlsAuth,
          { useRetry: true },
        );
    });
  });
});
