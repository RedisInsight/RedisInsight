import { Injectable } from '@nestjs/common';
import { RecommendationProvider } from 'src/modules/database-recommendation/scanner/recommendation.provider';

@Injectable()
export class RecommendationScanner {
  constructor(
    private readonly recommendationProvider: RecommendationProvider,
  ) {}

  async determineRecommendation(name: string, data: any) {
    const strategy = this.recommendationProvider.getStrategy(name);
    try {
      const recommendation = await strategy.isRecommendationReached(data);

      if (recommendation.isReached) {
        return { name, params: recommendation?.params };
      }
    } catch (err) {
      // ignore errors
      return null;
    }

    return null;
  }
}
