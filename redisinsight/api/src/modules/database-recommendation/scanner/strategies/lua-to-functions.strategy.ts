import { AbstractRecommendationStrategy }
  from 'src/modules/database-recommendation/scanner/strategies/abstract.recommendation.strategy';
import { IDatabaseRecommendationStrategyData }
  from 'src/modules/database-recommendation/scanner/recommendation.strategy.interface';
import { DatabaseService } from 'src/modules/database/database.service';
import { isTriggeredAndFunctionsModule } from 'src/utils';
import { LUA_TO_FUNCTIONS_RECOMMENDATION_COUNT } from 'src/common/constants';
import { SessionMetadata } from 'src/common/models';

export class LuaToFunctionsStrategy extends AbstractRecommendationStrategy {
  private databaseService: DatabaseService;

  constructor(
    databaseService: DatabaseService,
  ) {
    super();
    this.databaseService = databaseService;
  }

  /**
   * Check lua to functions recommendation
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
    return { isReached: data.info.cashedScripts > LUA_TO_FUNCTIONS_RECOMMENDATION_COUNT };
  }
}
