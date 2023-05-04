import { AbstractRecommendationStrategy }
  from 'src/modules/database-recommendation/scanner/strategies/abstract.recommendation.strategy';
import { IDatabaseRecommendationStrategyData }
  from 'src/modules/database-recommendation/scanner/recommendation.strategy.interface';
import { getUTF8FromBuffer } from 'src/utils/cli-helper';
import { checkTimestamp } from '../utils';

const maxPercentage = 99;

export class RTSStrategy extends AbstractRecommendationStrategy {
  /**
   * Check rts recommendation
   * @param data
   */

  async isRecommendationReached(
    data,
  ): Promise<IDatabaseRecommendationStrategyData> {
    const timestampMemberNames = data?.members.filter(({ name }) => checkTimestamp(getUTF8FromBuffer(name as Buffer)));
    if ((timestampMemberNames.length / data?.members.length) * 100 >= maxPercentage) {
      return { isReached: true, params: { keys: [data?.keyName] } };
    }
    const timestampMemberScores = data?.members.filter(({ score }) => checkTimestamp(String(score)));
    if ((timestampMemberScores.length / data?.members.length) * 100 >= maxPercentage) {
      return { isReached: true, params: { keys: [data?.keyName] } };
    }
    return { isReached: false };
  }
}
