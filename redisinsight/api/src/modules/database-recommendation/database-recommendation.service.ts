import { Injectable, Logger } from '@nestjs/common';
import { sum } from 'lodash';
import { DatabaseRecommendationProvider }
  from 'src/modules/database-recommendation/providers/database-recommendation.provider';
import { DatabaseRecommendation } from 'src/modules/database-recommendation/models';
import { RecommendationScanner } from 'src/modules/database-recommendation/scanner/recommendations.scanner';
import { ClientMetadata } from 'src/common/models';
import {
  DatabaseRecommendationsResponse,
} from 'src/modules/database-recommendation/dto/database-recommendations.response';
import { Recommendation } from 'src/modules/database-analysis/models/recommendation';
import { ModifyDatabaseRecommendationDto, DeleteDatabaseRecommendationResponse } from './dto';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class DatabaseRecommendationService {
  private logger = new Logger('DatabaseRecommendationService');

  constructor(
    private readonly databaseRecommendationsProvider: DatabaseRecommendationProvider,
    private readonly scanner: RecommendationScanner,
    private readonly databaseService: DatabaseService,
  ) {}

  /**
   * Create recommendation entity
   * @param clientMetadata
   * @param recommendationName
   */
  public async create(clientMetadata: ClientMetadata, recommendationName: string): Promise<DatabaseRecommendation> {
    return this.databaseRecommendationsProvider.create(clientMetadata, recommendationName);
  }

  /**
   * Get recommendations list for particular database
   * @param clientMetadata
   */
  async list(clientMetadata: ClientMetadata): Promise<DatabaseRecommendationsResponse> {
    this.logger.log('Getting database recommendations');
    const db = clientMetadata.db ?? (await this.databaseService.get(clientMetadata.databaseId))?.db ?? 0;
    return this.databaseRecommendationsProvider.list({ ...clientMetadata, db });
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
    const newClientMetadata = {
      ...clientMetadata,
      db: clientMetadata.db ?? (await this.databaseService.get(clientMetadata.databaseId))?.db ?? 0,
    };
    const isRecommendationExist = await this.databaseRecommendationsProvider.isExist(
      newClientMetadata,
      recommendationName,
    );
    if (!isRecommendationExist) {
      const isRecommendationReached = await this.scanner.determineRecommendation(recommendationName, data);

      if (isRecommendationReached) {
        return await this.databaseRecommendationsProvider.create(newClientMetadata, recommendationName);
      }
    }

    return null;
  }

  /**
   * Mark all recommendations as read for particular database
   * @param clientMetadata
   */
  public async read(clientMetadata: ClientMetadata): Promise<void> {
    this.logger.log('Reading database recommendations');
    return this.databaseRecommendationsProvider.read(clientMetadata);
  }

  /**
   * Update extended recommendation
   * @param clientMetadata
   * @param id
   * @param dto
   */
  public async update(
    clientMetadata: ClientMetadata,
    id: string, dto: ModifyDatabaseRecommendationDto,
  ): Promise<DatabaseRecommendation> {
    this.logger.log(`Update database extended recommendations id:${id}`);
    return this.databaseRecommendationsProvider.update(clientMetadata, id, dto);
  }

  /**
   * Sync db analysis recommendations and live recommendations
   * @param clientMetadata
   * @param recommendations
   */
  public async sync(clientMetadata: ClientMetadata, recommendations: Recommendation[]): Promise<void> {
    return this.databaseRecommendationsProvider.sync(clientMetadata, recommendations);
  }

  /**
   * Delete database recommendation by id
   * @param clientMetadata
   * @param id
   */
  async delete(clientMetadata: ClientMetadata, id: string): Promise<void> {
    this.logger.log(`Deleting recommendation: ${id}`);
    await this.databaseRecommendationsProvider.delete(clientMetadata, id);
  }

  /**
   * Bulk delete recommendations. Uses "delete" method and skipping error
   * Returns successfully deleted recommendations number
   * @param clientMetadata
   * @param ids
   */
  async bulkDelete(clientMetadata: ClientMetadata, ids: string[]): Promise<DeleteDatabaseRecommendationResponse> {
    this.logger.log(`Deleting many recommendations: ${ids}`);

    return {
      affected: sum(await Promise.all(ids.map(async (id) => {
        try {
          await this.delete(clientMetadata, id);
          return 1;
        } catch (e) {
          return 0;
        }
      }))),
    };
  }
}
