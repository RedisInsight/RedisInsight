import { AbstractRecommendationStrategy }
  from 'src/modules/database-recommendation/scanner/strategies/abstract.recommendation.strategy';
import { IDatabaseRecommendationStrategyData }
  from 'src/modules/database-recommendation/scanner/recommendation.strategy.interface';
import { RedisDataType, GetKeyInfoResponse } from 'src/modules/browser/dto';

const bigStringSize = 5_000_000;

export class BigStringStrategy extends AbstractRecommendationStrategy {
  /**
   * Check big strings recommendation
   * @param key
   */

  async isRecommendationReached(
    key: GetKeyInfoResponse,
  ): Promise<IDatabaseRecommendationStrategyData> {
    const isBigString = key.type === RedisDataType.String && key.size > bigStringSize;

    return isBigString
      ? { isReached: true, params: { keys: [key?.name] } }
      : { isReached: false };
  }
}
