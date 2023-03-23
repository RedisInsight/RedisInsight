import { Command } from 'ioredis';
import { AbstractRecommendationStrategy }
  from 'src/modules/database-recommendation/scanner/strategies/abstract.recommendation.strategy';
import { get } from 'lodash';
import * as semverCompare from 'node-version-compare';
import { convertRedisInfoReplyToObject } from 'src/utils';

const minRedisVersion = '6';

export class RedisVersionStrategy extends AbstractRecommendationStrategy {
  /**
   * Check redis version recommendation
   * @param client
   */

  async isRecommendationReached(
    client,
  ): Promise<boolean> {
    try {
      const info = convertRedisInfoReplyToObject(
        await client.sendCommand(
          new Command('info', ['server'], { replyEncoding: 'utf8' }),
        ) as string,
      );
      const version = get(info, 'server.redis_version');
      return !(semverCompare(version, minRedisVersion) >= 0);
    } catch (err) {
      return false;
    }
  }
}
