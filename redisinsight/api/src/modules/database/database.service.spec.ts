import { InternalServerErrorException, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { omit, get, update } from 'lodash';

import { classToClass } from 'src/utils';
import {
  mockDatabase,
  mockDatabaseAnalytics,
  mockDatabaseFactory,
  mockDatabaseInfoProvider,
  mockDatabaseRepository,
  mockRedisService,
  MockType,
  mockRedisGeneralInfo,
  mockRedisConnectionFactory,
  mockDatabaseWithTls,
  mockDatabaseWithTlsAuth,
  mockDatabaseWithSshPrivateKey,
  mockSentinelDatabaseWithTlsAuth,
  mockDatabaseWithCloudDetails,
} from 'src/__mocks__';
import { DatabaseAnalytics } from 'src/modules/database/database.analytics';
import { DatabaseService } from 'src/modules/database/database.service';
import { DatabaseRepository } from 'src/modules/database/repositories/database.repository';
import { RedisService } from 'src/modules/redis/redis.service';
import { DatabaseInfoProvider } from 'src/modules/database/providers/database-info.provider';
import { DatabaseFactory } from 'src/modules/database/providers/database.factory';
import { UpdateDatabaseDto } from 'src/modules/database/dto/update.database.dto';
import { RedisConnectionFactory } from 'src/modules/redis/redis-connection.factory';
import { RedisErrorCodes } from 'src/constants';
import { ExportDatabase } from './models/export-database';

describe('DatabaseService', () => {
  let service: DatabaseService;
  let databaseRepository: MockType<DatabaseRepository>;
  let databaseFactory: MockType<DatabaseFactory>;
  let redisConnectionFactory: MockType<RedisConnectionFactory>;
  let analytics: MockType<DatabaseAnalytics>;
  const exportSecurityFields: string[] = [
    'password',
    'clientCert.key',
    'sshOptions.password',
    'sshOptions.passphrase',
    'sshOptions.privateKey',
    'sentinelMaster.password',
  ];

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventEmitter2,
        DatabaseService,
        {
          provide: DatabaseRepository,
          useFactory: mockDatabaseRepository,
        },
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
          provide: DatabaseFactory,
          useFactory: mockDatabaseFactory,
        },
        {
          provide: DatabaseAnalytics,
          useFactory: mockDatabaseAnalytics,
        },
      ],
    }).compile();

    service = await module.get(DatabaseService);
    databaseRepository = await module.get(DatabaseRepository);
    databaseFactory = await module.get(DatabaseFactory);
    redisConnectionFactory = await module.get(RedisConnectionFactory);
    analytics = await module.get(DatabaseAnalytics);
  });

  describe('exists', () => {
    it('should return true if database exists', async () => {
      expect(await service.exists(mockDatabase.id)).toEqual(true);
    });
  });

  describe('list', () => {
    it('should return databases and send analytics event', async () => {
      databaseRepository.list.mockResolvedValue([mockDatabase, mockDatabase]);
      expect(await service.list()).toEqual([mockDatabase, mockDatabase]);
    });
    it('should throw InternalServerErrorException?', async () => {
      databaseRepository.list.mockRejectedValueOnce(new Error());
      await expect(service.list()).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('get', () => {
    it('should return database by id', async () => {
      expect(await service.get(mockDatabase.id)).toEqual(mockDatabase);
    });
    it('should throw NotFound if no database found', async () => {
      databaseRepository.get.mockResolvedValueOnce(null);
      await expect(service.get(mockDatabase.id)).rejects.toThrow(NotFoundException);
    });
    it('should throw NotFound if no database id was provided', async () => {
      await expect(service.get('')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create new database and send analytics event', async () => {
      expect(await service.create(mockDatabase)).toEqual(mockDatabase);
      expect(analytics.sendInstanceAddedEvent).toHaveBeenCalledWith(mockDatabase, mockRedisGeneralInfo);
      expect(analytics.sendInstanceAddFailedEvent).not.toHaveBeenCalled();
    });
    it('should create new database with cloud details and send analytics event', async () => {
      databaseRepository.create.mockResolvedValueOnce(mockDatabaseWithCloudDetails);
      expect(await service.create(mockDatabaseWithCloudDetails)).toEqual(mockDatabaseWithCloudDetails);
      expect(analytics.sendInstanceAddedEvent).toHaveBeenCalledWith(mockDatabaseWithCloudDetails, mockRedisGeneralInfo);
      expect(analytics.sendInstanceAddFailedEvent).not.toHaveBeenCalled();
    });
    it('should not fail when collecting data for analytics event', async () => {
      redisConnectionFactory.createRedisConnection.mockRejectedValueOnce(new Error());
      expect(await service.create(mockDatabase)).toEqual(mockDatabase);
      expect(analytics.sendInstanceAddedEvent).not.toHaveBeenCalled();
      expect(analytics.sendInstanceAddFailedEvent).not.toHaveBeenCalled();
    });
    it('should throw NotFound if no database?', async () => {
      databaseRepository.create.mockRejectedValueOnce(new NotFoundException());
      await expect(service.create(mockDatabase)).rejects.toThrow(NotFoundException);
      expect(analytics.sendInstanceAddFailedEvent).toHaveBeenCalledWith(new NotFoundException());
    });
  });

  describe('update', () => {
    it('should update existing database and send analytics event', async () => {
      databaseRepository.update.mockReturnValue({
        ...mockDatabase,
        port: 6380,
        password: 'password',
        provider: 'LOCALHOST',
      });

      await expect(await service.update(
        mockDatabase.id,
        { password: 'password', port: 6380 } as UpdateDatabaseDto,
        true,
      )).toEqual({ ...mockDatabase, port: 6380, password: 'password' });
      expect(analytics.sendInstanceEditedEvent).toHaveBeenCalledWith(
        mockDatabase,
        { ...mockDatabase, port: 6380, password: 'password' },
        true,
      );
    });
    it('should throw NotFound if no database?', async () => {
      databaseRepository.update.mockRejectedValueOnce(new NotFoundException());
      await expect(service.update(
        mockDatabase.id,
        { password: 'password' } as UpdateDatabaseDto,
        true,
      )).rejects.toThrow(NotFoundException);
    });
  });

  describe('test', () => {
    it('should successfully test valid connection config', async () => {
      expect(await service.testConnection(mockDatabase)).toEqual(undefined);
    });
    it('should successfully test valid sentinel config (without sentinelMaster)', async () => {
      databaseFactory.createDatabaseModel.mockRejectedValueOnce(new Error(RedisErrorCodes.SentinelParamsRequired));
      expect(await service.testConnection(mockDatabase)).toEqual(undefined);
    });
    it('should throw connection error', async () => {
      databaseFactory.createDatabaseModel.mockRejectedValueOnce(new Error(RedisErrorCodes.ConnectionRefused));

      await expect(service.testConnection(mockDatabase))
        .rejects.toThrow(ServiceUnavailableException);
    });
  });

  describe('delete', () => {
    it('should remove existing database', async () => {
      expect(await service.delete(mockDatabase.id)).toEqual(undefined);
      expect(analytics.sendInstanceDeletedEvent).toHaveBeenCalledWith(mockDatabase);
    });
    it('should throw NotFound if no database', async () => {
      databaseRepository.get.mockResolvedValueOnce(null);
      await expect(service.delete(mockDatabase.id)).rejects.toThrow(NotFoundException);
    });
    it('should throw InternalServerErrorException? on any error during deletion', async () => {
      databaseRepository.delete.mockRejectedValueOnce(new NotFoundException());
      await expect(service.delete(mockDatabase.id)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('bulkDelete', () => {
    it('should remove multiple databases', async () => {
      expect(await service.bulkDelete([mockDatabase.id])).toEqual({ affected: 1 });
    });
    it('should ignore errors and do not count affected', async () => {
      databaseRepository.delete.mockRejectedValueOnce(new NotFoundException());
      expect(await service.bulkDelete([mockDatabase.id])).toEqual({ affected: 0 });
    });
  });

  describe('export', () => {
    it('should return multiple databases without Standalone secrets', async () => {
      databaseRepository.get.mockResolvedValueOnce(mockDatabaseWithTlsAuth);

      expect(await service.export([mockDatabaseWithTlsAuth.id], false)).toEqual([classToClass(ExportDatabase, omit(mockDatabaseWithTlsAuth, 'password'))]);
    });

    it('should return multiple databases without SSH secrets', async () => {
      // remove SSH secrets
      const mockDatabaseWithSshPrivateKeyTemp = { ...mockDatabaseWithSshPrivateKey };
      exportSecurityFields.forEach((field) => {
        if (get(mockDatabaseWithSshPrivateKeyTemp, field)) {
          update(mockDatabaseWithSshPrivateKeyTemp, field, () => null);
        }
      });

      databaseRepository.get.mockResolvedValueOnce(mockDatabaseWithSshPrivateKey);
      expect(await service.export([mockDatabaseWithSshPrivateKey.id], false)).toEqual([classToClass(ExportDatabase, mockDatabaseWithSshPrivateKeyTemp)]);
    });

    it('should return multiple databases without Sentinel secrets', async () => {
      // remove secrets
      const mockSentinelDatabaseWithTlsAuthTemp = { ...mockSentinelDatabaseWithTlsAuth };
      exportSecurityFields.forEach((field) => {
        if (get(mockSentinelDatabaseWithTlsAuthTemp, field)) {
          update(mockSentinelDatabaseWithTlsAuthTemp, field, () => null);
        }
      });

      databaseRepository.get.mockResolvedValue(mockSentinelDatabaseWithTlsAuth);

      expect(await service.export([mockSentinelDatabaseWithTlsAuth.id], false)).toEqual([classToClass(ExportDatabase, omit(mockSentinelDatabaseWithTlsAuthTemp, 'password'))]);
    });

    it('should return multiple databases with secrets', async () => {
      // Standalone
      databaseRepository.get.mockResolvedValueOnce(mockDatabaseWithTls);
      expect(await service.export([mockDatabaseWithTls.id], true)).toEqual([classToClass(ExportDatabase, mockDatabaseWithTls)]);

      // SSH
      databaseRepository.get.mockResolvedValueOnce(mockDatabaseWithSshPrivateKey);
      expect(await service.export([mockDatabaseWithSshPrivateKey.id], true)).toEqual([classToClass(ExportDatabase, mockDatabaseWithSshPrivateKey)]);

      // Sentinel
      databaseRepository.get.mockResolvedValueOnce(mockSentinelDatabaseWithTlsAuth);
      expect(await service.export([mockSentinelDatabaseWithTlsAuth.id], true)).toEqual([classToClass(ExportDatabase, mockSentinelDatabaseWithTlsAuth)]);
    });

    it('should ignore errors', async () => {
      databaseRepository.get.mockRejectedValueOnce(new NotFoundException());
      expect(await service.export([mockDatabase.id])).toEqual([]);
    });
  });
});
