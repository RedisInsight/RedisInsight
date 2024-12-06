import { Test, TestingModule } from '@nestjs/testing';
import { MockType, mockRdiClientProvider, mockLoggerService } from 'src/__mocks__';
import { RdiClientMetadata, RdiStatisticsResult, RdiStatisticsStatus } from 'src/modules/rdi/models';
import { RdiClientProvider } from 'src/modules/rdi/providers/rdi.client.provider';
import { RdiStatisticsService } from 'src/modules/rdi/rdi-statistics.service';
import { LoggerService } from 'src/modules/logger/logger.service';

describe('RdiStatisticsService', () => {
  let service: RdiStatisticsService;
  let rdiClientProvider: MockType<RdiClientProvider>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RdiStatisticsService,
        {
          provide: LoggerService,
          useValue: mockLoggerService,
        },
        {
          provide: RdiClientProvider,
          useFactory: mockRdiClientProvider,
        },
      ],
    }).compile();

    service = module.get(RdiStatisticsService);
    rdiClientProvider = module.get(RdiClientProvider);
  });

  describe('getStatistics', () => {
    const rdiClientMetadata: RdiClientMetadata = {
      id: '123',
      sessionMetadata: undefined,
    };
    const sections = 'section1,section2';

    it('should call getOrCreate on RdiClientProvider with correct arguments', async () => {
      const client = {
        getStatistics: jest.fn().mockResolvedValue({}),
      };
      rdiClientProvider.getOrCreate.mockResolvedValue(client);

      await service.getStatistics(rdiClientMetadata, sections);

      expect(rdiClientProvider.getOrCreate).toHaveBeenCalledWith(rdiClientMetadata);
    });

    it('should call getStatistics on RdiClient with correct arguments', async () => {
      const client = {
        getStatistics: jest.fn().mockResolvedValue({}),
      };
      rdiClientProvider.getOrCreate.mockResolvedValue(client);

      await service.getStatistics(rdiClientMetadata, sections);

      expect(client.getStatistics).toHaveBeenCalledWith(sections);
    });

    it('should return the result of getStatistics on RdiClient', async () => {
      const expectedResult: RdiStatisticsResult = {
        status: RdiStatisticsStatus.Success,
      };
      const client = {
        getStatistics: jest.fn().mockResolvedValue(expectedResult),
      };
      rdiClientProvider.getOrCreate.mockResolvedValue(client);

      const result = await service.getStatistics(rdiClientMetadata, sections);

      expect(result).toEqual(expectedResult);
    });
  });
});
