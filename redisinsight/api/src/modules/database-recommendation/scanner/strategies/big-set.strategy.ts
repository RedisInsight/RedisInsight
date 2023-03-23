import { AbstractRecommendationStrategy }
  from 'src/modules/database-recommendation/scanner/strategies/abstract.recommendation.strategy';
import { RedisDataType, GetKeyInfoResponse } from 'src/modules/browser/dto';

const maxSetLength = 100_000;

export class BigSetStrategy extends AbstractRecommendationStrategy {
  /**
   * Check big set recommendation
   * @param key
   */

  async isRecommendationReached(
    key: GetKeyInfoResponse,
  ): Promise<boolean> {
    return key?.type === RedisDataType.Set && key?.length > maxSetLength;
  }
}
