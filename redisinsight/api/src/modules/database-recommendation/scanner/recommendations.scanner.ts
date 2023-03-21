import { Injectable } from '@nestjs/common';
import { RecommendationProvider } from 'src/modules/database-recommendation/scanner/recommendation.provider';

@Injectable()
export class RecommendationScanner {
  constructor(
    private readonly recommendationProvider: RecommendationProvider,
  ) {}

  async determineRecommendation(name: string, data: any) {
    const strategy = this.recommendationProvider.getStrategy(name);
    const isRecommendationReached = await strategy.isRecommendationReached(data);

    if (isRecommendationReached) {
      return { name };
    }
    return null;
  }
}
