import { isNaN, toNumber } from 'lodash';
import { AbstractRecommendationStrategy }
  from 'src/modules/database-recommendation/scanner/strategies/abstract.recommendation.strategy';
import { IntegersInSets } from 'src/modules/database-recommendation/models';
import { getUTF8FromRedisString } from 'src/utils/cli-helper';

const maxCountMembersForCheck = 50;

export class IntegersInSetStrategy extends AbstractRecommendationStrategy {
  /**
   * Check integers in sets recommendation
   * @param data
   */

  async isRecommendationReached(
    data: IntegersInSets,
  ): Promise<boolean> {
    const isNotIntegerInSet = data?.members?.slice(0, maxCountMembersForCheck).some(
      (member) => isNaN(toNumber(getUTF8FromRedisString(member))),
    );

    return !!isNotIntegerInSet;
  }
}
