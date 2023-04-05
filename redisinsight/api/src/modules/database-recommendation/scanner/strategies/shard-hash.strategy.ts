import { AbstractRecommendationStrategy }
  from 'src/modules/database-recommendation/scanner/strategies/abstract.recommendation.strategy';

const maxHashLength = 5_000;

export class ShardHashStrategy extends AbstractRecommendationStrategy {
  /**
   * Check shard big hashes to small hashes recommendation
   * @param total
   */

  async isRecommendationReached(
    total: number,
  ): Promise<boolean> {
    return total > maxHashLength;
  }
}
