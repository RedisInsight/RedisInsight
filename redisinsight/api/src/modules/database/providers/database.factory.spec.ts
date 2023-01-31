import { Test, TestingModule } from '@nestjs/testing';
import {
  mockCaCertificateService,
  mockClientCertificateService, mockClusterDatabaseWithTlsAuth,
  mockDatabase,
  mockDatabaseInfoProvider, mockDatabaseWithTlsAuth,
  mockIORedisClient, mockIORedisCluster, mockIORedisSentinel, mockRedisConnectionFactory,
  mockRedisNoPermError,
  mockRedisService,
  mockSentinelDatabaseWithTlsAuth,
  MockType,
} from 'src/__mocks__';
import { DatabaseFactory } from 'src/modules/database/providers/database.factory';
import { RedisService } from 'src/modules/redis/redis.service';
import { DatabaseInfoProvider } from 'src/modules/database/providers/database-info.provider';
import { CaCertificateService } from 'src/modules/certificate/ca-certificate.service';
import { ClientCertificateService } from 'src/modules/certificate/client-certificate.service';
import { ConnectionType } from 'src/modules/database/entities/database.entity';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { NotFoundException } from '@nestjs/common';
import { RedisErrorCodes } from 'src/constants';
import { RedisConnectionFactory } from 'src/modules/redis/redis-connection.factory';

describe('DatabaseFactory', () => {
  let service: DatabaseFactory;
  let databaseInfoProvider: MockType<DatabaseInfoProvider>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseFactory,
        {
          provide: RedisService,
          useFactory: mockRedisService,
        },
        {
          provide: RedisConnectionFactory,
          useFactory: mockRedisConnectionFactory,
        },
        {
          provide: DatabaseInfoProvider,
          useFactory: mockDatabaseInfoProvider,
        },
        {
          provide: CaCertificateService,
          useFactory: mockCaCertificateService,
        },
        {
          provide: ClientCertificateService,
          useFactory: mockClientCertificateService,
        },
      ],
    }).compile();

    service = await module.get(DatabaseFactory);
    databaseInfoProvider = await module.get(DatabaseInfoProvider);
  });

  describe('createDatabaseModel', () => {
    it('should create standalone database model', async () => {
      databaseInfoProvider.isSentinel.mockResolvedValue(false);
      databaseInfoProvider.isCluster.mockResolvedValue(false);

      const result = await service.createDatabaseModel(mockDatabase);

      expect(result).toEqual(mockDatabase);
    });
    it('should create sentinel database model', async () => {
      databaseInfoProvider.isSentinel.mockResolvedValue(true);
      databaseInfoProvider.isCluster.mockResolvedValue(false);

      const result = await service.createDatabaseModel(mockSentinelDatabaseWithTlsAuth);

      expect(result).toEqual(mockSentinelDatabaseWithTlsAuth);
    });
    it('should throw an error for sentinel without sentinelMaster field provided', async () => {
      databaseInfoProvider.isSentinel.mockResolvedValue(true);
      databaseInfoProvider.isCluster.mockResolvedValue(false);
      try {
        await service.createDatabaseModel(mockDatabase);
        fail();
      } catch (e) {
        expect(e.message).toEqual(RedisErrorCodes.SentinelParamsRequired);
      }
    });
    it('should create cluster database model', async () => {
      databaseInfoProvider.isSentinel.mockResolvedValue(false);
      databaseInfoProvider.isCluster.mockResolvedValue(true);

      const result = await service.createDatabaseModel(mockClusterDatabaseWithTlsAuth);

      expect(result).toEqual(mockClusterDatabaseWithTlsAuth);
    });
  });

  describe('createStandaloneDatabaseModel', () => {
    it('should create standalone database model without certs', async () => {
      const result = await service.createStandaloneDatabaseModel(mockDatabase);

      expect(result).toEqual(mockDatabase);
    });
    it('should create standalone database model and fetch existing certs', async () => {
      const result = await service.createStandaloneDatabaseModel(mockDatabaseWithTlsAuth);

      expect(result).toEqual(mockDatabaseWithTlsAuth);
    });
  });

  describe('createClusterDatabaseModel', () => {
    it('should create cluster database model', async () => {
      const result = await service.createClusterDatabaseModel({
        ...mockClusterDatabaseWithTlsAuth,
        connectionType: ConnectionType.STANDALONE,
      }, mockIORedisCluster);

      expect(result).toEqual(mockClusterDatabaseWithTlsAuth);
      expect(mockIORedisCluster.disconnect).toHaveBeenCalled();
    });

    it('should throw ACL error if no permissions', async () => {
      databaseInfoProvider.determineClusterNodes.mockRejectedValueOnce(mockRedisNoPermError);

      try {
        await service.createClusterDatabaseModel({
          ...mockSentinelDatabaseWithTlsAuth,
          connectionType: ConnectionType.STANDALONE,
        }, mockIORedisClient);
        fail();
      } catch (e) {
        // todo: returned BadRequest. why not Forbidden?
        // expect(e).toBeInstanceOf(ForbiddenException);
        expect(e.message).toEqual(mockRedisNoPermError.message);
      }
    });
  });

  describe('createSentinelDatabaseModel', () => {
    it('should create sentinel database model', async () => {
      const result = await service.createSentinelDatabaseModel({
        ...mockSentinelDatabaseWithTlsAuth,
        connectionType: ConnectionType.STANDALONE,
      }, mockIORedisClient);

      expect(result).toEqual(mockSentinelDatabaseWithTlsAuth);
      expect(mockIORedisSentinel.disconnect).toHaveBeenCalled();
    });

    it('should throw NotFound error if no such master group', async () => {
      try {
        await service.createSentinelDatabaseModel({
          ...mockSentinelDatabaseWithTlsAuth,
          connectionType: ConnectionType.STANDALONE,
          sentinelMaster: {
            ...mockSentinelDatabaseWithTlsAuth.sentinelMaster,
            name: 'not existing master group',
          },
        }, mockIORedisClient);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.MASTER_GROUP_NOT_EXIST);
      }
    });

    it('should throw ACL error if no permissions', async () => {
      databaseInfoProvider.determineSentinelMasterGroups.mockRejectedValueOnce(mockRedisNoPermError);

      try {
        await service.createSentinelDatabaseModel({
          ...mockSentinelDatabaseWithTlsAuth,
          connectionType: ConnectionType.STANDALONE,
          sentinelMaster: {
            ...mockSentinelDatabaseWithTlsAuth.sentinelMaster,
            name: 'not existing master group',
          },
        }, mockIORedisClient);
        fail();
      } catch (e) {
        // todo: returned BadRequest. why not Forbidden?
        // expect(e).toBeInstanceOf(ForbiddenException);
        expect(e.message).toEqual(mockRedisNoPermError.message);
      }
    });
  });
});
