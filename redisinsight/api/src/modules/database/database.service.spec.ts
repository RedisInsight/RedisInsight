import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  mockDatabase, mockDatabaseAnalytics, mockDatabaseFactory, mockDatabaseInfoProvider, mockDatabaseRepository,
  mockRedisService, MockType, mockRedisGeneralInfo,
} from 'src/__mocks__';
import { DatabaseAnalytics } from 'src/modules/database/database.analytics';
import { DatabaseService } from 'src/modules/database/database.service';
import { DatabaseRepository } from 'src/modules/database/repositories/database.repository';
import { RedisService } from 'src/modules/redis/redis.service';
import { DatabaseInfoProvider } from 'src/modules/database/providers/database-info.provider';
import { DatabaseFactory } from 'src/modules/database/providers/database.factory';
import { UpdateDatabaseDto } from 'src/modules/database/dto/update.database.dto';

describe('DatabaseService', () => {
  let service: DatabaseService;
  let databaseRepository: MockType<DatabaseRepository>;
  let redisService: MockType<RedisService>;
  let analytics: MockType<DatabaseAnalytics>;

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
    redisService = await module.get(RedisService);
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
      expect(analytics.sendInstanceListReceivedEvent).toHaveBeenCalledWith([mockDatabase, mockDatabase]);
    });
    it('should throw InternalServerErrorException?', async () => {
      databaseRepository.list.mockRejectedValueOnce(new Error());
      await expect(service.list()).rejects.toThrow(InternalServerErrorException);
      expect(analytics.sendInstanceListReceivedEvent).not.toHaveBeenCalled();
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
  });

  describe('create', () => {
    it('should create new database and send analytics event', async () => {
      expect(await service.create(mockDatabase)).toEqual(mockDatabase);
      expect(analytics.sendInstanceAddedEvent).toHaveBeenCalledWith(mockDatabase, mockRedisGeneralInfo);
      expect(analytics.sendInstanceAddFailedEvent).not.toHaveBeenCalled();
    });
    it('should not fail when collecting data for analytics event', async () => {
      redisService.connectToDatabaseInstance.mockRejectedValueOnce(new Error());
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
      expect(await service.update(
        mockDatabase.id,
        { password: 'password' } as UpdateDatabaseDto,
        true,
      )).toEqual(mockDatabase);
      expect(analytics.sendInstanceEditedEvent).toHaveBeenCalledWith(
        mockDatabase,
        {
          ...mockDatabase,
          password: 'password',
        },
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
});
