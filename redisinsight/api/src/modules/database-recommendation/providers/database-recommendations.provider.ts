import { Injectable, Logger } from '@nestjs/common';
import { DatabaseRecommendationsEntity }
  from 'src/modules/database-recommendation/entities/database-recommendations.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { RecommendationDto, RecommendationsDto } from 'src/modules/database-recommendation/dto';
import { ClientMetadata } from 'src/common/models';

@Injectable()
export class DatabaseRecommendationsProvider {
  private readonly logger = new Logger('DatabaseRecommendationsProvider');

  constructor(
    @InjectRepository(DatabaseRecommendationsEntity)
    private readonly repository: Repository<DatabaseRecommendationsEntity>,
  ) {}

  /**
   * Save entire entity
   * @param databaseId
   * @param recommendationName
   */
  async create(databaseId: string, recommendationName: string): Promise<RecommendationDto> {
    this.logger.log('Creating database recommendation');
    return await this.repository.save(
      plainToClass(DatabaseRecommendationsEntity, { databaseId, name: recommendationName }),
    );
  }

  /**
   * Return list of database recommendations
   * @param clientMetadata
   */
  async list(clientMetadata: ClientMetadata): Promise<RecommendationsDto> {
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
    return plainToClass(RecommendationsDto, {
      recommendations,
      totalUnread,
    });
  }

  /**
   * Return list of database recommendations
   * @param databaseId
   */
  async read(databaseId: string): Promise<RecommendationsDto> {
    this.logger.log('Getting database recommendations list');
    await this.repository
      .createQueryBuilder('r')
      .update()
      .where({ databaseId })
      .set({ read: true })
      .execute();

    const totalUnread = await this.repository
      .createQueryBuilder()
      .where({ databaseId, read: false })
      .getCount();

    return new RecommendationsDto({
      recommendations: [],
      totalUnread,
    });
  }
}
