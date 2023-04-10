import { SearchVisualizationCommands } from 'src/common/constants';
import { AbstractRecommendationStrategy }
  from 'src/modules/database-recommendation/scanner/strategies/abstract.recommendation.strategy';

export class SearchVisualizationStrategy extends AbstractRecommendationStrategy {
  /**
   * Check user runs one of the specified search commands via CLI
   * @param commandInit
   */

  async isRecommendationReached(
    commandInit: string = '',
  ): Promise<boolean> {
    const [ command ] = commandInit.split(' ')
    return Object.values(SearchVisualizationCommands).includes(command.toUpperCase() as SearchVisualizationCommands);
  }
}
