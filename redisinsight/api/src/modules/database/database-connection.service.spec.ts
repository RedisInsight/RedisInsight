import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  mockCommonClientMetadata,
  mockDatabase,
  mockDatabaseAnalytics,
  mockDatabaseInfoProvider,
  mockDatabaseRepository,
  mockDatabaseService,
  mockIORedisClient, mockRedisConnectionFactory,
  mockRedisNoAuthError,
  mockRedisService,
  mockDatabaseRecommendationService,
  MockType,
  mockRedisGeneralInfo,
} from 'src/__mocks__';
import { DatabaseAnalytics } from 'src/modules/database/database.analytics';
import { DatabaseService } from 'src/modules/database/database.service';
import { DatabaseRecommendationService } from 'src/modules/database-recommendation/database-recommendation.service';
import { DatabaseRepository } from 'src/modules/database/repositories/database.repository';
import { RedisService } from 'src/modules/redis/redis.service';
import { DatabaseInfoProvider } from 'src/modules/database/providers/database-info.provider';
import { DatabaseConnectionService } from 'src/modules/database/database-connection.service';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { RedisConnectionFactory } from 'src/modules/redis/redis-connection.factory';
import { RECOMMENDATION_NAMES } from 'src/constants';

describe('DatabaseConnectionService', () => {
  let service: DatabaseConnectionService;
  let redisService: MockType<RedisService>;
  let redisConnectionFactory: MockType<RedisConnectionFactory>;
  let analytics: MockType<DatabaseAnalytics>;
  let recommendationService: MockType<DatabaseRecommendationService>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseConnectionService,
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
          provide: DatabaseService,
          useFactory: mockDatabaseService,
        },
        {
          provide: DatabaseAnalytics,
          useFactory: mockDatabaseAnalytics,
        },
        {
          provide: DatabaseRecommendationService,
          useFactory: mockDatabaseRecommendationService,
        },
      ],
    }).compile();

    service = await module.get(DatabaseConnectionService);
    redisService = await module.get(RedisService);
    redisConnectionFactory = await module.get(RedisConnectionFactory);
    analytics = await module.get(DatabaseAnalytics);
    recommendationService = module.get(DatabaseRecommendationService);
  });

  describe('connect', () => {
    it('should connect to database', async () => {
      expect(await service.connect(mockCommonClientMetadata)).toEqual(undefined);
      expect(redisConnectionFactory.createRedisConnection).not.toHaveBeenCalled();
    });

    it('should call recommendationService', async () => {
      expect(await service.connect(mockCommonClientMetadata)).toEqual(undefined);

      expect(recommendationService.check).toHaveBeenCalledTimes(3);

      expect(recommendationService.check).toBeCalledWith(
        mockCommonClientMetadata,
        RECOMMENDATION_NAMES.REDIS_VERSION,
        mockRedisGeneralInfo,
      );
      expect(recommendationService.check).toBeCalledWith(
        mockCommonClientMetadata,
        RECOMMENDATION_NAMES.LUA_SCRIPT,
        mockRedisGeneralInfo,
      );
      expect(recommendationService.check).toBeCalledWith(
        mockCommonClientMetadata,
        RECOMMENDATION_NAMES.BIG_AMOUNT_OF_CONNECTED_CLIENTS,
        mockRedisGeneralInfo,
      );
    });
  });

  describe('getOrCreateClient', () => {
    it('should get existing client', async () => {
      expect(await service.getOrCreateClient(mockCommonClientMetadata)).toEqual(mockIORedisClient);
      expect(redisConnectionFactory.createRedisConnection).not.toHaveBeenCalled();
    });
    it('should create new and save it client', async () => {
      redisService.getClientInstance.mockResolvedValue(null);

      expect(await service.getOrCreateClient(mockCommonClientMetadata)).toEqual(mockIORedisClient);
      expect(redisConnectionFactory.createRedisConnection).toHaveBeenCalled();
      expect(redisService.setClientInstance).toHaveBeenCalled();
    });
  });

  describe('createClient', () => {
    it('should create client for standalone datbaase', async () => {
      expect(await service.createClient(mockCommonClientMetadata)).toEqual(mockIORedisClient);
    });
    it('should throw Unauthorized error in case of NOAUTH', async () => {
      redisConnectionFactory.createRedisConnection.mockRejectedValueOnce(mockRedisNoAuthError);
      await expect(service.createClient(mockCommonClientMetadata)).rejects.toThrow(UnauthorizedException);
      expect(analytics.sendConnectionFailedEvent).toHaveBeenCalledWith(
        mockDatabase,
        new UnauthorizedException(ERROR_MESSAGES.AUTHENTICATION_FAILED()),
      );
    });
  });
});
