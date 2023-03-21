import { Command } from 'ioredis';
import { AbstractRecommendationStrategy }
  from 'src/modules/database-recommendation/scanner/strategies/abstract.recommendation.strategy';
import { DatabaseService } from 'src/modules/database/database.service';
import { RedisDataType, GetKeyInfoResponse } from 'src/modules/browser/dto';
import { Redisearch } from 'src/modules/database-recommendation/models/redisearch';

const maxRediSearchStringMemory = 512 * 1024;

export class RediSearchStrategy extends AbstractRecommendationStrategy {
  private databaseService: DatabaseService;

  constructor(
    databaseService: DatabaseService,
  ) {
    super();
    this.databaseService = databaseService;
  }

  /**
   * Check redis search recommendation
   * @param data
   */

  async isRecommendationReached(
    data: Redisearch,
  ): Promise<boolean> {
    try {
      // todo: refactor. no need entire entity here
      const { modules } = await this.databaseService.get(data.databaseId);

      if (modules.find((({ name }) => name === 'search'))) {
        const indexes = await data.client.sendCommand(
          new Command('FT._LIST', [], { replyEncoding: 'utf8' }),
        ) as any[];

        if (indexes.length) {
          return false;
        }
      }
      const isBigString = data.keys.some((key: GetKeyInfoResponse) => (
        key.type === RedisDataType.String && key.size > maxRediSearchStringMemory
      ));
      return !!isBigString;
    } catch (err) {
      return false;
    }
  }
}
