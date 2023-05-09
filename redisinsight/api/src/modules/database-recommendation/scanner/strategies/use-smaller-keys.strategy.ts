import { AbstractRecommendationStrategy }
  from 'src/modules/database-recommendation/scanner/strategies/abstract.recommendation.strategy';
import { IDatabaseRecommendationStrategyData }
  from 'src/modules/database-recommendation/scanner/recommendation.strategy.interface';

const maxDatabaseTotal = 1_000_000;

export class UseSmallerKeysStrategy extends AbstractRecommendationStrategy {
  /**
   * Check use smaller keys recommendation
   * @param total
   */

  async isRecommendationReached(total: number): Promise<IDatabaseRecommendationStrategyData> {
    return { isReached: total > maxDatabaseTotal };
  }
}
