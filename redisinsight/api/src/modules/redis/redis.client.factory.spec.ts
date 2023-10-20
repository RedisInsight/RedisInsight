import { Test, TestingModule } from '@nestjs/testing';
import * as Redis from 'ioredis';
import {
  mockClientMetadata, mockClusterDatabaseWithTlsAuth,
  mockDatabase,
  mockDatabaseWithTlsAuth, mockFeatureService,
  mockIORedisClient, mockIORedisCluster, mockIORedisSentinel, mockRedisConnectionStrategy,
  mockSentinelDatabaseWithTlsAuth, mockSshTunnelProvider, mockStandaloneRedisClient
} from 'src/__mocks__';
import { RedisConnectionFactory } from 'src/modules/redis/redis-connection.factory';
import { Database } from 'src/modules/database/models/database';
import { EventEmitter } from 'events';
import apiConfig from 'src/utils/config';
import { SshTunnelProvider } from 'src/modules/ssh/ssh-tunnel.provider';
import { RedisClientFactory } from 'src/modules/redis/redis.client.factory';
import { IoredisRedisConnectionStrategy } from 'src/modules/redis/connection/ioredis.redis.connection.strategy';
import { NodeRedisConnectionStrategy } from 'src/modules/redis/connection/node.redis.connection.strategy';
import { FeatureService } from 'src/modules/feature/feature.service';

const REDIS_CLIENTS_CONFIG = apiConfig.get('redis_clients');

jest.mock('ioredis', () => ({
  ...jest.requireActual('ioredis') as object,
}));

describe('RedisClientFactory', () => {
  let module: TestingModule;
  let service: RedisClientFactory;
  let ioredisRedisConnectionStrategy: IoredisRedisConnectionStrategy;
  let nodeRedisConnectionStrategy: NodeRedisConnectionStrategy;
  let featureService: FeatureService;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        RedisClientFactory,
        {
          provide: IoredisRedisConnectionStrategy,
          useFactory: mockRedisConnectionStrategy,
        },
        {
          provide: NodeRedisConnectionStrategy,
          useFactory: mockRedisConnectionStrategy,
        },
        {
          provide: FeatureService,
          useFactory: mockFeatureService,
        },
      ],
    })
      .compile();

    service = await module.get(RedisClientFactory);
    ioredisRedisConnectionStrategy = await module.get(IoredisRedisConnectionStrategy);
    nodeRedisConnectionStrategy = await module.get(NodeRedisConnectionStrategy);
    featureService = await module.get(FeatureService);
  });

  // describe('createClientAutomatically', () => {
  //   beforeEach(() => {
  //     service.createSentinelConnection = jest.fn()
  //       .mockRejectedValueOnce(new Error());
  //     service.createClusterConnection = jest.fn()
  //       .mockRejectedValueOnce(new Error());
  //     service.createStandaloneConnection = jest.fn()
  //       .mockRejectedValueOnce(new Error());
  //   });
  //   it('should create standalone client', async () => {
  //     service.createStandaloneConnection = jest.fn()
  //       .mockResolvedValue(mockIORedisClient);
  //
  //     const result = await service.createClientAutomatically(mockClientMetadata, mockDatabase);
  //
  //     expect(result)
  //       .toEqual(mockIORedisClient);
  //     expect(service.createStandaloneConnection)
  //       .toHaveBeenCalledWith(mockClientMetadata, mockDatabase, { useRetry: true });
  //   });
  //
  //   it('should create cluster client', async () => {
  //     service.createClusterConnection = jest.fn()
  //       .mockResolvedValue(mockIORedisCluster);
  //
  //     const result = await service.createClientAutomatically(mockClientMetadata, mockClusterDatabaseWithTlsAuth);
  //
  //     expect(result)
  //       .toEqual(mockIORedisCluster);
  //     expect(service.createClusterConnection)
  //       .toHaveBeenCalledWith(
  //         mockClientMetadata,
  //         mockClusterDatabaseWithTlsAuth,
  //         { useRetry: true },
  //       );
  //     expect(service.createStandaloneConnection)
  //       .not
  //       .toHaveBeenCalled();
  //   });
  //
  //   it('should create sentinel client', async () => {
  //     service.createSentinelConnection = jest.fn()
  //       .mockResolvedValue(mockIORedisSentinel);
  //
  //     const result = await service.createClientAutomatically(mockClientMetadata, mockSentinelDatabaseWithTlsAuth);
  //
  //     expect(result)
  //       .toEqual(mockIORedisSentinel);
  //     expect(service.createSentinelConnection)
  //       .toHaveBeenCalledWith(
  //         mockClientMetadata,
  //         mockSentinelDatabaseWithTlsAuth,
  //         { useRetry: true },
  //       );
  //     expect(service.createClusterConnection)
  //       .not
  //       .toHaveBeenCalled();
  //     expect(service.createStandaloneConnection)
  //       .not
  //       .toHaveBeenCalled();
  //   });
  // });

  describe('createClient', () => {
    it('should create standalone client', async () => {
      const result = await service.createClient(mockClientMetadata, mockDatabase);

      expect(result).toEqual(mockStandaloneRedisClient);
      expect(ioredisRedisConnectionStrategy.createStandaloneClient)
        .toHaveBeenCalledWith(mockClientMetadata, mockDatabase, { useRetry: true });
    });
    //
    // it('should trigger auto discovery connection type (when no connectionType defined)', async () => {
    //   service.createClientAutomatically = jest.fn()
    //     .mockResolvedValue(mockIORedisClient);
    //   const mockDatabaseWithoutConnectionType = Object.assign(new Database(), {
    //     ...mockDatabase,
    //     connectionType: null,
    //   });
    //
    //   const result = await service.createRedisConnection(mockClientMetadata, mockDatabaseWithoutConnectionType);
    //
    //   expect(result)
    //     .toEqual(mockIORedisClient);
    //   expect(service.createClientAutomatically)
    //     .toHaveBeenCalledWith(
    //       mockClientMetadata,
    //       {
    //         ...mockDatabaseWithoutConnectionType,
    //         connectionType: undefined,
    //       },
    //       undefined,
    //     );
    // });
    //
    // it('should create cluster client', async () => {
    //   service.createClusterConnection = jest.fn()
    //     .mockResolvedValue(mockIORedisCluster);
    //
    //   const result = await service.createRedisConnection(mockClientMetadata, mockClusterDatabaseWithTlsAuth);
    //
    //   expect(result)
    //     .toEqual(mockIORedisCluster);
    //   expect(service.createClusterConnection)
    //     .toHaveBeenCalledWith(
    //       mockClientMetadata,
    //       mockClusterDatabaseWithTlsAuth,
    //       { useRetry: true },
    //     );
    // });
    //
    // it('should create sentinel client', async () => {
    //   service.createSentinelConnection = jest.fn()
    //     .mockResolvedValue(mockIORedisSentinel);
    //
    //   const result = await service.createRedisConnection(mockClientMetadata, mockSentinelDatabaseWithTlsAuth);
    //
    //   expect(result)
    //     .toEqual(mockIORedisSentinel);
    //   expect(service.createSentinelConnection)
    //     .toHaveBeenCalledWith(
    //       mockClientMetadata,
    //       mockSentinelDatabaseWithTlsAuth,
    //       { useRetry: true },
    //     );
    // });
  });
});
