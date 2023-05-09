import Redis, { Command } from 'ioredis';
import { AbstractRecommendationStrategy }
  from 'src/modules/database-recommendation/scanner/strategies/abstract.recommendation.strategy';
import { IDatabaseRecommendationStrategyData }
  from 'src/modules/database-recommendation/scanner/recommendation.strategy.interface';
import { get } from 'lodash';
import { convertRedisInfoReplyToObject } from 'src/utils';

const minNumberOfCachedScripts = 10;

export class AvoidLuaScriptsStrategy extends AbstractRecommendationStrategy {
  /**
   * Check lua script recommendation
   * @param redisClient
   */

  async isRecommendationReached(redisClient: Redis): Promise<IDatabaseRecommendationStrategyData> {
    const info = convertRedisInfoReplyToObject(
      await redisClient.sendCommand(
        new Command('info', ['memory'], { replyEncoding: 'utf8' }),
      ) as string,
    );

    const nodesNumbersOfCachedScripts = get(info, 'memory.number_of_cached_scripts');
    const isReached = parseInt(nodesNumbersOfCachedScripts, 10) > minNumberOfCachedScripts;

    return { isReached };
  }
}
