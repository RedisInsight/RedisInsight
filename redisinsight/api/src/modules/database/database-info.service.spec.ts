import { Test, TestingModule } from '@nestjs/testing';
import IORedis from 'ioredis';
import {
  mockCommonClientMetadata,
  mockDatabaseConnectionService,
  mockDatabaseInfoProvider, mockDatabaseOverview, mockDatabaseOverviewProvider,
  mockDatabaseRecommendationService,
  mockDatabaseService,
  mockRedisGeneralInfo,
  MockType,
} from 'src/__mocks__';
import { DatabaseInfoProvider } from 'src/modules/database/providers/database-info.provider';
import { DatabaseConnectionService } from 'src/modules/database/database-connection.service';
import { DatabaseInfoService } from 'src/modules/database/database-info.service';
import { DatabaseOverviewProvider } from 'src/modules/database/providers/database-overview.provider';
import { DatabaseRecommendationService } from 'src/modules/database-recommendation/database-recommendation.service';
import { RECOMMENDATION_NAMES } from 'src/constants';
import { DatabaseService } from './database.service';

const nodeClient = Object.create(IORedis.prototype);
nodeClient.isCluster = false;
nodeClient.disconnect = () => {};

describe('DatabaseConnectionService', () => {
  let service: DatabaseInfoService;
  let databaseConnectionService: MockType<DatabaseConnectionService>;
  let recommendationService: MockType<DatabaseRecommendationService>;
  let databaseService: MockType<DatabaseService>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseInfoService,
        {
          provide: DatabaseConnectionService,
          useFactory: mockDatabaseConnectionService,
        },
        {
          provide: DatabaseOverviewProvider,
          useFactory: mockDatabaseOverviewProvider,
        },
        {
          provide: DatabaseInfoProvider,
          useFactory: mockDatabaseInfoProvider,
        },
        {
          provide: DatabaseRecommendationService,
          useFactory: mockDatabaseRecommendationService,
        },
        {
          provide: DatabaseService,
          useFactory: mockDatabaseService,
        },
      ],
    }).compile();

    service = await module.get(DatabaseInfoService);
    databaseConnectionService = await module.get(DatabaseConnectionService);
    recommendationService = module.get(DatabaseRecommendationService);
    databaseService = module.get(DatabaseService);
  });

  describe('getInfo', () => {
    it('should create client and get general info', async () => {
      expect(await service.getInfo(mockCommonClientMetadata)).toEqual(mockRedisGeneralInfo);
    });
  });

  describe('getOverview', () => {
    it('should create client and get overview', async () => {
      expect(await service.getOverview(mockCommonClientMetadata)).toEqual(mockDatabaseOverview);
    });
  });

  describe('getDatabaseIndex', () => {
    it('should not return a new client', async () => {
      expect(await service.getDatabaseIndex(mockCommonClientMetadata, 0)).toEqual(undefined);
    });
    it('Should throw Error when error during creating a client', async () => {
      databaseConnectionService.createClient.mockRejectedValueOnce(new Error());
      await expect(service.getDatabaseIndex(mockCommonClientMetadata, 0)).rejects.toThrow(Error);
    });
    it('getDatabaseIndex should call databaseService.get() if previous clientMetadata.db is Undefined', async () => {
      const db = 2;
      databaseConnectionService.createClient.mockResolvedValueOnce(nodeClient);
      await service.getDatabaseIndex(mockCommonClientMetadata, db);

      expect(databaseService.get).toBeCalledWith(mockCommonClientMetadata.databaseId);
    });
    describe('recommendationService', () => {
      it('getDatabaseIndex should call recommendationService', async () => {
        const db = 2;
        databaseConnectionService.createClient.mockResolvedValueOnce(nodeClient);
        await service.getDatabaseIndex(mockCommonClientMetadata, db);

        expect(recommendationService.check).toBeCalledWith(
          { ...mockCommonClientMetadata, db },
          RECOMMENDATION_NAMES.AVOID_LOGICAL_DATABASES,
          { db, prevDb: 0 },
        );
      });
      it('getDatabaseIndex should not call recommendationService if Error exists', async () => {
        databaseConnectionService.createClient.mockRejectedValueOnce(new Error());
        await expect(service.getDatabaseIndex(mockCommonClientMetadata, 2)).rejects.toThrow(Error);
        await expect(recommendationService.check).toBeCalledTimes(0);
        await expect(databaseService.get).toBeCalledTimes(1);
        await expect(databaseService.get).toBeCalledWith(mockCommonClientMetadata.databaseId);
      });
    });
  });
});
