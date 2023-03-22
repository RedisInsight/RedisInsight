import { Injectable, Logger } from '@nestjs/common';
import { DatabaseRecommendationProvider }
  from 'src/modules/database-recommendation/providers/database-recommendation.provider';
import { DatabaseRecommendationsResponse, DatabaseRecommendation } from 'src/modules/database-recommendation/models';
import { RecommendationScanner } from 'src/modules/database-recommendation/scanner/recommendations.scanner';
import { ClientMetadata } from 'src/common/models';

@Injectable()
export class DatabaseRecommendationService {
  private logger = new Logger('DatabaseRecommendationService');

  constructor(
    private readonly databaseRecommendationsProvider: DatabaseRecommendationProvider,
    private readonly scanner: RecommendationScanner,
  ) {}

  /**
   * Create recommendation entity
   * @param databaseId
   * @param recommendationName
   */
  public async create(databaseId: string, recommendationName: string): Promise<DatabaseRecommendation> {
    return this.databaseRecommendationsProvider.create(databaseId, recommendationName);
  }

  /**
   * Get recommendations list for particular database
   * @param clientMetadata
   */
  async list(clientMetadata: ClientMetadata): Promise<DatabaseRecommendationsResponse> {
    this.logger.log('Getting database recommendations');
    return this.databaseRecommendationsProvider.list(clientMetadata);
  }

  /**
   * Check recommendation condition
   * @param clientMetadata
   * @param recommendationName
   * @param data
   */
  public async check(
    clientMetadata: ClientMetadata,
    recommendationName: string,
    data: any,
  ): Promise<DatabaseRecommendation> {
    // todo: move it on db layer
    const result = await this.databaseRecommendationsProvider.list(clientMetadata);
    if (!result.recommendations.find((recommendation) => recommendation.name === recommendationName)) {
      const isRecommendationReached = await this.scanner.determineRecommendation(recommendationName, data);

      if (isRecommendationReached) {
        return await this.databaseRecommendationsProvider.create(clientMetadata.databaseId, recommendationName);
      }
    }

    return null;
  }

  /**
   * Mark all recommendations as read for particular database
   * @param clientMetadata
   */
  async read(clientMetadata: ClientMetadata): Promise<void> {
    this.logger.log('Reading database recommendations');
    return this.databaseRecommendationsProvider.read(clientMetadata);
  }
}
