import { AbstractRecommendationStrategy }
  from 'src/modules/database-recommendation/scanner/strategies/abstract.recommendation.strategy';

export class AvoidLogicalDatabasesStrategy extends AbstractRecommendationStrategy {
  /**
   * Check avoid use logical databases recommendation
   * @param databases
   */

  async isRecommendationReached(
    { prevDb, db }: { prevDb: number, db: number},
  ): Promise<boolean> {
      return prevDb !== db
  }
}
