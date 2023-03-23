import { Command } from 'ioredis';
import { AbstractRecommendationStrategy }
  from 'src/modules/database-recommendation/scanner/strategies/abstract.recommendation.strategy';
import { DatabaseService } from 'src/modules/database/database.service';
import { RedisDataType, GetKeyInfoResponse } from 'src/modules/browser/dto';
import { SearchString } from 'src/modules/database-recommendation/models/searchString';
import { isRedisearchModule } from 'src/utils';

const maxRediSearchStringMemory = 512 * 1024;

export class SearchStringStrategy extends AbstractRecommendationStrategy {
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
    data: SearchString,
  ): Promise<boolean> {
    // todo: refactor. no need entire entity here
    const { modules } = await this.databaseService.get(data.databaseId);

    if (isRedisearchModule(modules)) {
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
  }
}
