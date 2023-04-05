import { AbstractRecommendationStrategy }
  from 'src/modules/database-recommendation/scanner/strategies/abstract.recommendation.strategy';
import { isJson } from 'src/utils/base.helper';
import { getUTF8FromBuffer } from 'src/utils/cli-helper';

export class StringToJsonStrategy extends AbstractRecommendationStrategy {
  /**
   * Check JSON is used for Strings in Browser recommendation
   * @param data
   */

  async isRecommendationReached(
    data: Buffer,
  ): Promise<boolean> {
    return isJson(getUTF8FromBuffer(data));
  }
}
