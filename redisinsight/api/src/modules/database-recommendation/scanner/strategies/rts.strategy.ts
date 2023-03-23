import { AbstractRecommendationStrategy }
  from 'src/modules/database-recommendation/scanner/strategies/abstract.recommendation.strategy';
import { ZSetMemberDto } from 'src/modules/browser/dto';
import { getUTF8FromBuffer } from 'src/utils/cli-helper';
import { checkTimestamp } from '../utils';

const maxPercentage = 95;

export class RTSStrategy extends AbstractRecommendationStrategy {
  /**
   * Check rts recommendation
   * @param members
   */

  async isRecommendationReached(
    members: ZSetMemberDto[],
  ): Promise<boolean> {
    const timestampMemberNames = members.filter(({ name }) => checkTimestamp(getUTF8FromBuffer(name as Buffer)));
    if ((timestampMemberNames.length / members.length) * 100 > maxPercentage) {
      return true;
    }
    const timestampMemberScores = members.filter(({ score }) => checkTimestamp(String(score)));
    if ((timestampMemberScores.length / members.length) * 100 > maxPercentage) {
      return true;
    }
    return false;
  }
}
