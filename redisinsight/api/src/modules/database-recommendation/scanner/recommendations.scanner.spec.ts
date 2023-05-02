import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationScanner } from 'src/modules/database-recommendation/scanner/recommendations.scanner';
import { RecommendationProvider } from 'src/modules/database-recommendation/scanner/recommendation.provider';

const mockRecommendationStrategy = () => ({
  isReached: jest.fn(),
});

const mockRecommendationProvider = () => ({
  getStrategy: jest.fn(),
});

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
    recommendationStrategy.isRecommendationReached.mockResolvedValue({ isReached: true });
  });

  describe('determineRecommendation', () => {
    it('should determine recommendation', async () => {
      expect(await service.determineRecommendation('name', {
        data: 'some value',
      })).toEqual({ name: 'name' });
    });
  });
});
