import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationScanner } from 'src/modules/database-recommendation/scanner/recommendations.scanner';
import { RecommendationProvider } from 'src/modules/database-recommendation/scanner/recommendation.provider';

const mockRecommendationStrategy = () => ({
  isRecommendationReached: jest.fn(),
});

const mockRecommendationProvider = () => ({
  getStrategy: jest.fn(),
});

const mockData = 'some data';

describe('RecommendationScanner', () => {
  let service: RecommendationScanner;
  let recommendationProvider;
  let recommendationStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecommendationScanner,
        {
          provide: RecommendationProvider,
          useFactory: mockRecommendationProvider,
        },
      ],
    }).compile();

    service = module.get<RecommendationScanner>(RecommendationScanner);
    recommendationProvider = module.get<RecommendationProvider>(RecommendationProvider);
    recommendationStrategy = mockRecommendationStrategy();
    recommendationProvider.getStrategy.mockReturnValue(recommendationStrategy);
  });

  describe('determineRecommendation', () => {
    it('should determine recommendation', async () => {
      recommendationStrategy.isRecommendationReached.mockResolvedValue({ isReached: true });

      expect(await service.determineRecommendation('name', {
        data: mockData,
      })).toEqual({ name: 'name' });
    });

    it('should return null when isRecommendationReached throw error', async () => {
      recommendationStrategy.isRecommendationReached.mockRejectedValueOnce(new Error());

      expect(await service.determineRecommendation('name', {
        data: mockData,
      })).toEqual(null);
    });

    it('should return null when isReached is false', async () => {
      recommendationStrategy.isRecommendationReached.mockResolvedValue({ isReached: false });

      expect(await service.determineRecommendation('name', {
        data: mockData,
      })).toEqual(null);
    });
  });
});
