import { AbstractRecommendationStrategy }
  from 'src/modules/database-recommendation/scanner/strategies/abstract.recommendation.strategy';
import { IDatabaseRecommendationStrategyData }
  from 'src/modules/database-recommendation/scanner/recommendation.strategy.interface';
import { RedisDataType, GetKeyInfoResponse } from 'src/modules/browser/dto';

const maxSetLength = 100_000;

export class BigSetStrategy extends AbstractRecommendationStrategy {
  /**
   * Check big set recommendation
   * @param key
   */

  async isRecommendationReached(
    key: GetKeyInfoResponse,
  ): Promise<IDatabaseRecommendationStrategyData> {
    return key?.type === RedisDataType.Set && key?.length > maxSetLength
      ? { isReached: true, params: { keys: [key?.name] } }
      : { isReached: false };
  }
}
