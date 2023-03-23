import { Injectable, Logger } from '@nestjs/common';
import { DatabaseRecommendationEntity }
  from 'src/modules/database-recommendation/entities/database-recommendation.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { DatabaseRecommendation, DatabaseRecommendationsResponse } from 'src/modules/database-recommendation/models';
import { ClientMetadata } from 'src/common/models';

@Injectable()
export class DatabaseRecommendationProvider {
  private readonly logger = new Logger('DatabaseRecommendationProvider');

  constructor(
    @InjectRepository(DatabaseRecommendationEntity)
    private readonly repository: Repository<DatabaseRecommendationEntity>,
  ) {}

  /**
   * Save entire entity
   * @param databaseId
   * @param recommendationName
   */
  async create(databaseId: string, recommendationName: string): Promise<DatabaseRecommendation> {
    this.logger.log('Creating database recommendation');
    return this.repository.save(
      plainToClass(DatabaseRecommendation, { databaseId, name: recommendationName }),
    );
  }

  /**
   * Return list of database recommendations
   * @param clientMetadata
   */
  async list(clientMetadata: ClientMetadata): Promise<DatabaseRecommendationsResponse> {
    this.logger.log('Getting database recommendations list');
    const recommendations = await this.repository
      .createQueryBuilder('r')
      .where({ databaseId: clientMetadata.databaseId })
      .select(['r.id', 'r.name'])
      .orderBy('r.createdAt', 'DESC')
      .getMany();

    const totalUnread = await this.repository
      .createQueryBuilder()
      .where({ databaseId: clientMetadata.databaseId, read: false })
      .getCount();

    this.logger.log('Succeed to get recommendations');
    return plainToClass(DatabaseRecommendationsResponse, {
      recommendations,
      totalUnread,
    });
  }

  /**
   * Read all recommendations recommendations
   * @param clientMetadata
   */
  async read(clientMetadata: ClientMetadata): Promise<void> {
    this.logger.log('Marking all recommendations as read');
    await this.repository
      .createQueryBuilder('r')
      .update()
      .where({ databaseId: clientMetadata.databaseId })
      .set({ read: true })
      .execute();
  }

  /**
   * Check is recommendation exist in database
   * @param clientMetadata
   * @param name
   */
  async isExist(
    clientMetadata: ClientMetadata,
    name: string,
  ): Promise<boolean> {
    try {
      this.logger.log(`Checking is recommendation ${name} exist`);
      const recommendation = await this.repository.findOneBy({ databaseId: clientMetadata.databaseId, name });
  
      this.logger.log(`Succeed to check is recommendation ${name} exist'`);
      return !!recommendation;
    } catch (err) {
      this.logger.error(`Failed to check is recommendation ${name} exist'`);
      return false;
    }
  }
}
