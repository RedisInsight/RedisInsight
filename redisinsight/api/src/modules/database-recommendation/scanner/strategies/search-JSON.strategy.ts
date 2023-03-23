import { Command } from 'ioredis';
import { AbstractRecommendationStrategy }
  from 'src/modules/database-recommendation/scanner/strategies/abstract.recommendation.strategy';
import { DatabaseService } from 'src/modules/database/database.service';
import { RedisDataType, GetKeyInfoResponse } from 'src/modules/browser/dto';
import { SearchJSON } from 'src/modules/database-recommendation/models';

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
  ): Promise<boolean> {
    try {
      // todo: refactor. no need entire entity here
      const { modules } = await this.databaseService.get(data.databaseId);

      if (modules.find((({ name }) => name === 'search'))) {
        const indexes = await data.client.sendCommand(
          new Command('FT._LIST', [], { replyEncoding: 'utf8' }),
        ) as string[];

        if (indexes.length) {
          return false;
        }
      }
      const isJSON = data.keys.some((key: GetKeyInfoResponse) => key.type === RedisDataType.JSON);
      return !!isJSON;
    } catch (err) {
      return false;
    }
  }
}
