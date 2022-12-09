import { Test, TestingModule } from '@nestjs/testing';
import {
  mockCommonClientMetadata,
  mockDatabaseConnectionService,
  mockDatabaseInfoProvider, mockDatabaseOverview, mockDatabaseOverviewProvider,
  mockRedisGeneralInfo,
} from 'src/__mocks__';
import { DatabaseInfoProvider } from 'src/modules/database/providers/database-info.provider';
import { DatabaseConnectionService } from 'src/modules/database/database-connection.service';
import { DatabaseInfoService } from 'src/modules/database/database-info.service';
import { DatabaseOverviewProvider } from 'src/modules/database/providers/database-overview.provider';

describe('DatabaseConnectionService', () => {
  let service: DatabaseInfoService;

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
});
