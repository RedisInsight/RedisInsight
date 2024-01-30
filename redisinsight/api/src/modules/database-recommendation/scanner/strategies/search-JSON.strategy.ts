import { AbstractRecommendationStrategy }
  from 'src/modules/database-recommendation/scanner/strategies/abstract.recommendation.strategy';
import { IDatabaseRecommendationStrategyData }
  from 'src/modules/database-recommendation/scanner/recommendation.strategy.interface';
import { DatabaseService } from 'src/modules/database/database.service';
import { RedisDataType, GetKeyInfoResponse } from 'src/modules/browser/keys/dto';
import { SearchJSON } from 'src/modules/database-recommendation/models';
import { isRedisearchModule } from 'src/utils';

export class SearchJSONStrategy extends AbstractRecommendationStrategy {
  private databaseService: DatabaseService;

  constructor(
    databaseService: DatabaseService,
  ) {
    super();
    this.databaseService = databaseService;
  }

  /**
   * Check redis JSON recommendation
   * @param data
   */

  async isRecommendationReached(
    data: SearchJSON,
  ): Promise<IDatabaseRecommendationStrategyData> {
  // todo: refactor. no need entire entity here
    const { modules } = await this.databaseService.get(data.databaseId);

    if (isRedisearchModule(modules)) {
      const indexes = await data.client.sendCommand(
        ['FT._LIST'],
        { replyEncoding: 'utf8' },
      ) as string[];

      if (indexes.length) {
        return { isReached: false };
      }
    }
    const isJSON = data.keys.find((key: GetKeyInfoResponse) => key.type === RedisDataType.JSON);
    return isJSON ? { isReached: !!isJSON, params: { keys: [isJSON.name] } } : { isReached: false };
  }
}
