import { AbstractRecommendationStrategy }
  from 'src/modules/database-recommendation/scanner/strategies/abstract.recommendation.strategy';

export class DefaultRecommendationStrategy extends AbstractRecommendationStrategy {
  async isRecommendationReached(): Promise<boolean> {
    return false;
  }
}
