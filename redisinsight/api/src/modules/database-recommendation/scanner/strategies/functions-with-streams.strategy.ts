import { AbstractRecommendationStrategy }
  from 'src/modules/database-recommendation/scanner/strategies/abstract.recommendation.strategy';
import { IDatabaseRecommendationStrategyData }
  from 'src/modules/database-recommendation/scanner/recommendation.strategy.interface';
import { DatabaseService } from 'src/modules/database/database.service';
import { RedisDataType, GetKeyInfoResponse } from 'src/modules/browser/keys/dto';
import { isTriggeredAndFunctionsModule } from 'src/utils';
import { SessionMetadata } from 'src/common/models';

export class FunctionsWithStreamsStrategy extends AbstractRecommendationStrategy {
  private databaseService: DatabaseService;

  constructor(
    databaseService: DatabaseService,
  ) {
    super();
    this.databaseService = databaseService;
  }

  /**
   * Check functions with streams recommendation
   * @param data
   */

  async isRecommendationReached(
    data,
  ): Promise<IDatabaseRecommendationStrategyData> {
    // TODO: do the refactor outlined in search-JSON.strategy.ts?
    const { modules } = await this.databaseService.get({} as SessionMetadata, data.databaseId);

    if (isTriggeredAndFunctionsModule(modules)) {
      const libraries = await data.client.sendCommand(
        ['TFUNCTION', 'LIST'],
        { replyEncoding: 'utf8' },
      ) as string[];

      if (libraries.length) {
        return { isReached: false };
      }
    }
    const isStream = data.keys.some((key: GetKeyInfoResponse) => key.type === RedisDataType.Stream);
    return { isReached: isStream };
  }
}
