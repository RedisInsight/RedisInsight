import { Injectable, Logger } from '@nestjs/common';
import { DatabaseRecommendationsProvider }
  from 'src/modules/database-recommendation/providers/database-recommendations.provider';
import {
  CreateRecommendationDto,
  RecommendationsDto,
  RecommendationDto,
} from 'src/modules/database-recommendation/dto';
import { RecommendationScanner } from 'src/modules/database-recommendation/scanner/recommendations.scanner';
import { ClientMetadata } from 'src/common/models';

@Injectable()
export class DatabaseRecommendationsService {
  private logger = new Logger('DatabaseRecommendationsService');

  constructor(
    private readonly databaseRecommendationsProvider: DatabaseRecommendationsProvider,
    private readonly scanner: RecommendationScanner,
  ) {}

  /**
   * Create recommendation entity
   * @param databaseId
   * @param recommendationName
   */
  public async create(databaseId: string, recommendationName: string): Promise<CreateRecommendationDto> {
    return this.databaseRecommendationsProvider.create(databaseId, recommendationName);
  }

  /**
   * Get recommendations list for particular database
   * @param clientMetadata
   */
  async list(clientMetadata: ClientMetadata): Promise<RecommendationsDto> {
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
  ): Promise<RecommendationDto> {
    const result = await this.databaseRecommendationsProvider.list(clientMetadata);
    if (!result.recommendations.find((recommendation) => recommendation.name === recommendationName)) {
      const isRecommendationReached = await this.scanner.determineRecommendation(recommendationName, data);

      if (isRecommendationReached) {
        return this.databaseRecommendationsProvider.create(clientMetadata.databaseId, recommendationName);
      }
    }

    return null;
  }

  /**
   * Mark all recommendations as read for particular database
   * @param clientMetadata
   */
  async read(clientMetadata: ClientMetadata): Promise<RecommendationsDto> {
    this.logger.log('Reading database recommendations');
    return this.databaseRecommendationsProvider.read(clientMetadata.databaseId);
  }
}
