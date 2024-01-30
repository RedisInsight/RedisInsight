import { Test, TestingModule } from '@nestjs/testing';
import { get } from 'lodash';
import {
  mockCommonClientMetadata,
  mockDatabase,
  mockDatabaseAnalytics,
  mockDatabaseInfoProvider,
  mockDatabaseRepository,
  mockDatabaseService,
  mockStandaloneRedisClient,
  mockDatabaseRecommendationService,
  MockType,
  mockRedisGeneralInfo,
  mockRedisClientListResult,
  mockDatabaseClientFactory,
} from 'src/__mocks__';
import { DatabaseAnalytics } from 'src/modules/database/database.analytics';
import { DatabaseService } from 'src/modules/database/database.service';
import { DatabaseRecommendationService } from 'src/modules/database-recommendation/database-recommendation.service';
import { DatabaseRepository } from 'src/modules/database/repositories/database.repository';
import { DatabaseInfoProvider } from 'src/modules/database/providers/database-info.provider';
import { DatabaseConnectionService } from 'src/modules/database/database-connection.service';
import { RECOMMENDATION_NAMES } from 'src/constants';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';

describe('DatabaseConnectionService', () => {
  let service: DatabaseConnectionService;
  let analytics: MockType<DatabaseAnalytics>;
  let recommendationService: MockType<DatabaseRecommendationService>;
  let databaseInfoProvider: MockType<DatabaseInfoProvider>;

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
          provide: DatabaseClientFactory,
          useFactory: mockDatabaseClientFactory,
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
    analytics = await module.get(DatabaseAnalytics);
    recommendationService = module.get(DatabaseRecommendationService);
    databaseInfoProvider = module.get(DatabaseInfoProvider);
  });

  describe('connect', () => {
    it('should connect to database', async () => {
      expect(await service.connect(mockCommonClientMetadata)).toEqual(undefined);
    });

    it('should call recommendationService', async () => {
      expect(await service.connect(mockCommonClientMetadata)).toEqual(undefined);

      expect(recommendationService.check).toHaveBeenCalledTimes(5);

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
      expect(recommendationService.check).toBeCalledWith(
        mockCommonClientMetadata,
        RECOMMENDATION_NAMES.LUA_TO_FUNCTIONS,
        {
          client: mockStandaloneRedisClient,
          databaseId: mockCommonClientMetadata.databaseId,
          info: mockRedisGeneralInfo,
        },
      );
      expect(recommendationService.check).toBeCalledWith(
        mockCommonClientMetadata,
        RECOMMENDATION_NAMES.FUNCTIONS_WITH_KEYSPACE,
        { client: mockStandaloneRedisClient, databaseId: mockCommonClientMetadata.databaseId },
      );
    });

    it('should call databaseInfoProvider', async () => {
      expect(await service.connect(mockCommonClientMetadata)).toEqual(undefined);

      expect(databaseInfoProvider.determineDatabaseServer).toHaveBeenCalled();
      expect(databaseInfoProvider.determineDatabaseModules).toHaveBeenCalled();
    });

    it('should call getClientListInfo', async () => {
      expect(await service.connect(mockCommonClientMetadata)).toEqual(undefined);

      expect(databaseInfoProvider.getClientListInfo).toHaveBeenCalled();
      expect(analytics.sendDatabaseConnectedClientListEvent).toHaveBeenCalledWith(
        mockDatabase.id,
        {
          clients: mockRedisClientListResult.map((c) => ({
            version: mockRedisGeneralInfo.version,
            resp: get(c, 'resp', 'n/a'),
            libVer: get(c, 'lib-ver', 'n/a'),
            libName: get(c, 'lib-name', 'n/a'),
          })),
        },
      );
    });
  });
});
