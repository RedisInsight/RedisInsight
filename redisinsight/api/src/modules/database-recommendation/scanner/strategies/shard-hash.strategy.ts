import { AbstractRecommendationStrategy }
  from 'src/modules/database-recommendation/scanner/strategies/abstract.recommendation.strategy';
import { IDatabaseRecommendationStrategyData }
  from 'src/modules/database-recommendation/scanner/recommendation.strategy.interface';

const maxHashLength = 5_000;

export class ShardHashStrategy extends AbstractRecommendationStrategy {
  /**
   * Check shard big hashes to small hashes recommendation
   * @param data
   */

  async isRecommendationReached(
    data,
  ): Promise<IDatabaseRecommendationStrategyData> {
    return data.total > maxHashLength
      ? { isReached: true, params: { keys: [data.keyName] } }
      : { isReached: false };
  }
}
