import { GraphVisualizationCommands } from 'src/common/constants';
import { AbstractRecommendationStrategy }
  from 'src/modules/database-recommendation/scanner/strategies/abstract.recommendation.strategy';

export class GraphVisualizationStrategy extends AbstractRecommendationStrategy {
  /**
   * Check user runs one of the specified graph commands via CLI
   * @param commandInit
   */

  async isRecommendationReached(
    commandInit: string = '',
  ): Promise<boolean> {
    const [ command ] = commandInit.split(' ')
    return Object.values(GraphVisualizationCommands).includes(command.toUpperCase() as GraphVisualizationCommands);
  }
}
