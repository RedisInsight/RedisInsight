import { Test, TestingModule } from '@nestjs/testing';
import { ConnectionOptions } from 'tls';
import * as Redis from 'ioredis';
import {
  generateMockRedisClientInstance,
  mockCaCertificate,
  mockClientCertificate, mockClientMetadata, mockClusterDatabaseWithTlsAuth,
  mockDatabase,
  mockDatabaseEntity,
  mockIORedisClient, mockIORedisCluster, mockIORedisSentinel,
  mockRedisConnectionFactory, mockSentinelDatabaseWithTlsAuth
} from 'src/__mocks__';
import { ClientContext, Session } from 'src/common/models';
import { RedisService } from './redis.service';
import { RedisConnectionFactory } from 'src/modules/redis/redis-connection.factory';
import { Database } from 'src/modules/database/models/database';
//
// const mockClientMetadata = {
//   session: {
//     id: 'sessionId',
//   },
// };

const mockRedisClientInstance = {
  clientMetadata: {},
  session: {},
  databaseId: mockDatabase.id,
  context: ClientContext.Common,
  uniqueId: undefined,
  client: mockIORedisClient,
  lastTimeUsed: Date.now(),
};

const mockTlsConfigResult: ConnectionOptions = {
  rejectUnauthorized: true,
  servername: mockDatabaseEntity.tlsServername,
  checkServerIdentity: () => undefined,
  ca: [mockCaCertificate.certificate],
  key: mockClientCertificate.key,
  cert: mockClientCertificate.certificate,
};

jest.mock('ioredis', () => ({
  ...jest.requireActual('ioredis') as object,
  // default: jest.fn(),
}));

describe('RedisConnectionFactory', () => {
  let service: RedisConnectionFactory;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisConnectionFactory,
      ],
    }).compile();

    service = await module.get(RedisConnectionFactory);
  });

  describe('createClientAutomatically', () => {
    beforeEach(() => {
      service.createSentinelConnection = jest.fn().mockRejectedValueOnce(new Error());
      service.createClusterConnection = jest.fn().mockRejectedValueOnce(new Error());
      service.createStandaloneConnection = jest.fn().mockRejectedValueOnce(new Error());
    });
    it('should create standalone client', async () => {
      service.createStandaloneConnection = jest.fn().mockResolvedValue(mockIORedisClient);

      const result = await service.createClientAutomatically(mockClientMetadata, mockDatabase);

      expect(result).toEqual(mockIORedisClient);
      expect(service.createStandaloneConnection)
        .toHaveBeenCalledWith(mockClientMetadata, mockDatabase, { useRetry: true });
    });

    it('should create cluster client', async () => {
      service.createClusterConnection = jest.fn().mockResolvedValue(mockIORedisCluster);

      const result = await service.createClientAutomatically(mockClientMetadata, mockClusterDatabaseWithTlsAuth);

      expect(result).toEqual(mockIORedisCluster);
      expect(service.createClusterConnection).toHaveBeenCalledWith(
        mockClientMetadata,
        mockClusterDatabaseWithTlsAuth,
        { useRetry: true },
      );
      expect(service.createStandaloneConnection).not.toHaveBeenCalled();
    });

    it('should create sentinel client', async () => {
      service.createSentinelConnection = jest.fn().mockResolvedValue(mockIORedisSentinel);

      const result = await service.createClientAutomatically(mockClientMetadata, mockSentinelDatabaseWithTlsAuth);

      expect(result).toEqual(mockIORedisSentinel);
      expect(service.createSentinelConnection).toHaveBeenCalledWith(
        mockClientMetadata,
        mockSentinelDatabaseWithTlsAuth,
        { useRetry: true },
      );
      expect(service.createClusterConnection).not.toHaveBeenCalled();
      expect(service.createStandaloneConnection).not.toHaveBeenCalled();
    });
  });

  describe('connectToDatabaseInstance', () => {
    it('should create standalone client', async () => {
      service.createStandaloneConnection = jest.fn().mockResolvedValue(mockIORedisClient);

      const result = await service.createRedisConnection(mockClientMetadata, mockDatabase);

      expect(result).toEqual(mockIORedisClient);
      expect(service.createStandaloneConnection)
        .toHaveBeenCalledWith(mockClientMetadata, mockDatabase, { useRetry: true });
    });

    it('should trigger auto discovery connection type (when no connectionType defined)', async () => {
      service.createClientAutomatically = jest.fn().mockResolvedValue(mockIORedisClient);
      const mockDatabaseWithoutConnectionType = Object.assign(new Database(), {
        ...mockDatabase,
        connectionType: null,
      });

      const result = await service.createRedisConnection(mockClientMetadata, mockDatabaseWithoutConnectionType);

      expect(result).toEqual(mockIORedisClient);
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
      service.createClusterConnection = jest.fn().mockResolvedValue(mockIORedisCluster);

      const result = await service.createRedisConnection(mockClientMetadata, mockClusterDatabaseWithTlsAuth);

      expect(result).toEqual(mockIORedisCluster);
      expect(service.createClusterConnection).toHaveBeenCalledWith(
        mockClientMetadata,
        mockClusterDatabaseWithTlsAuth,
        { useRetry: true },
      );
    });

    it('should create sentinel client', async () => {
      service.createSentinelConnection = jest.fn().mockResolvedValue(mockIORedisSentinel);

      const result = await service.createRedisConnection(mockClientMetadata, mockSentinelDatabaseWithTlsAuth);

      expect(result).toEqual(mockIORedisSentinel);
      expect(service.createSentinelConnection).toHaveBeenCalledWith(
        mockClientMetadata,
        mockSentinelDatabaseWithTlsAuth,
        { useRetry: true },
      );
    });
  });

  // describe('getRedisConnectionConfig', () => {
  //   it('should return config with tls', async () => {
  //     service['getTLSConfig'] = jest.fn().mockResolvedValue(mockTlsConfigResult);
  //     const {
  //       host, port, password, username, db,
  //     } = mockClusterDatabaseWithTlsAuth;
  //
  //     const expectedResult = {
  //       host, port, username, password, db, tls: mockTlsConfigResult,
  //     };
  //
  //     const result = await service['getRedisConnectionConfig'](mockClusterDatabaseWithTlsAuth);
  //
  //     expect(JSON.stringify(result)).toEqual(JSON.stringify(expectedResult));
  //   });
  //   it('should return without tls', async () => {
  //     const {
  //       host, port, password, username, db,
  //     } = mockDatabase;
  //
  //     const expectedResult = {
  //       host, port, username, password, db,
  //     };
  //
  //     const result = await service['getRedisConnectionConfig'](mockDatabase);
  //
  //     expect(result).toEqual(expectedResult);
  //   });
  // });
  //
  // xdescribe('getTLSConfig', () => {
  //   it('should return tls config', async () => {
  //     const result = await service['getTLSConfig'](mockClusterDatabaseWithTlsAuth);
  //
  //     expect(JSON.stringify(result)).toEqual(
  //       JSON.stringify(mockTlsConfigResult),
  //     );
  //   });
  // });
});
