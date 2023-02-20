import { Test, TestingModule } from '@nestjs/testing';
import {
  mockCommonClientMetadata,
  mockDatabaseConnectionService,
  mockDatabaseInfoProvider, mockDatabaseOverview, mockDatabaseOverviewProvider,
  mockRedisGeneralInfo,
  MockType,
} from 'src/__mocks__';
import { DatabaseInfoProvider } from 'src/modules/database/providers/database-info.provider';
import { DatabaseConnectionService } from 'src/modules/database/database-connection.service';
import { DatabaseInfoService } from 'src/modules/database/database-info.service';
import { DatabaseOverviewProvider } from 'src/modules/database/providers/database-overview.provider';

describe('DatabaseConnectionService', () => {
  let service: DatabaseInfoService;
  let databaseConnectionService: MockType<DatabaseConnectionService>;

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
      ],
    }).compile();

    service = await module.get(DatabaseInfoService);
    databaseConnectionService = await module.get(DatabaseConnectionService);
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
  });
});
