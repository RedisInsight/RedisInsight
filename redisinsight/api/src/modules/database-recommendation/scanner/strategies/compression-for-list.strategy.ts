import { AbstractRecommendationStrategy }
  from 'src/modules/database-recommendation/scanner/strategies/abstract.recommendation.strategy';
import { IDatabaseRecommendationStrategyData }
  from 'src/modules/database-recommendation/scanner/recommendation.strategy.interface';
import { RedisDataType, GetKeyInfoResponse } from 'src/modules/browser/dto';

const maxListLength = 1_000;

export class CompressionForListStrategy extends AbstractRecommendationStrategy {
  /**
   * Check compression for list recommendation
   * @param key
   */

  async isRecommendationReached(
    key: GetKeyInfoResponse,
  ): Promise<IDatabaseRecommendationStrategyData> {
    const isBigList = key.type === RedisDataType.List && key.length > maxListLength

    return isBigList
      ? { isReached: true, params: { keys: [key?.name] } }
      : { isReached: false };
  }
}
