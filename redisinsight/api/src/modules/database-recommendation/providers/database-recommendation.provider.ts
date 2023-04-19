import {
  Injectable, InternalServerErrorException, Logger, NotFoundException,
} from '@nestjs/common';
import { DatabaseRecommendationEntity }
  from 'src/modules/database-recommendation/entities/database-recommendation.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { DatabaseRecommendation } from 'src/modules/database-recommendation/models';
import { Recommendation } from 'src/modules/database-analysis/models/recommendation';
import { ClientMetadata } from 'src/common/models';
import { sortRecommendations } from 'src/utils';
import ERROR_MESSAGES from 'src/constants/error-messages';
import {
  DatabaseRecommendationsResponse,
} from 'src/modules/database-recommendation/dto/database-recommendations.response';
import { RecommendationEvents } from 'src/modules/database-recommendation/constants';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class DatabaseRecommendationProvider {
  private readonly logger = new Logger('DatabaseRecommendationProvider');

  constructor(
    @InjectRepository(DatabaseRecommendationEntity)
    private readonly repository: Repository<DatabaseRecommendationEntity>,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Save entire entity
   * @param databaseId
   * @param recommendationName
   */
  async create({ databaseId }: ClientMetadata, recommendationName: string): Promise<DatabaseRecommendation> {
    this.logger.log('Creating database recommendation');
    const recommendation = plainToClass(
      DatabaseRecommendation,
      await this.repository.save({ databaseId, name: recommendationName }),
    );

    this.eventEmitter.emit(RecommendationEvents.NewRecommendation, [recommendation]);

    return recommendation;
  }

  /**
   * Return list of database recommendations
   * @param clientMetadata
   */
  async list({ databaseId }: ClientMetadata): Promise<DatabaseRecommendationsResponse> {
    this.logger.log('Getting database recommendations list');
    const recommendations = await this.repository
      .createQueryBuilder('r')
      .where({ databaseId })
      .select(['r.id', 'r.name', 'r.read', 'r.vote', 'disabled', 'r.hide'])
      .orderBy('r.createdAt', 'DESC')
      .getMany();

    const totalUnread = await this.repository
      .createQueryBuilder()
      .where({ databaseId, read: false })
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
  async read({ databaseId }: ClientMetadata): Promise<void> {
    this.logger.log('Marking all recommendations as read');
    await this.repository
      .createQueryBuilder('r')
      .update()
      .where({ databaseId })
      .set({ read: true })
      .execute();
  }

  /**
   * Update and return updated DatabaseRecommendation model
   * @param clientMetadata
   * @param id
   * @param recommendation
   */
  async update(
    clientMetadata: ClientMetadata,
    id: string,
    recommendation: Partial<DatabaseRecommendation>,
  ): Promise<DatabaseRecommendation> {
    this.logger.log(`Updating database recommendation with id:${id}`);
    const oldEntity = await this.repository.findOneBy({ id });

    if (!oldEntity) {
      this.logger.error(`Database recommendation with id:${id} was not Found`);
      throw new NotFoundException(ERROR_MESSAGES.DATABASE_RECOMMENDATION_NOT_FOUND);
    }

    const mergeResult = this.repository.merge(oldEntity, recommendation);
    await this.repository.update(id, plainToClass(DatabaseRecommendationEntity, mergeResult));

    this.logger.log(`Updated database recommendation with id:${id}`);

    return this.get(id);
  }

  /**
   * Check is recommendation exist in database
   * @param clientMetadata
   * @param name
   */
  async isExist(
    { databaseId }: ClientMetadata,
    name: string,
  ): Promise<boolean> {
    try {
      this.logger.log(`Checking is recommendation ${name} exist`);
      const recommendation = await this.repository.findOneBy({ databaseId, name });

      this.logger.log(`Succeed to check is recommendation ${name} exist'`);
      return !!recommendation;
    } catch (err) {
      this.logger.error(`Failed to check is recommendation ${name} exist'`);
      return false;
    }
  }

  /**
   * Get recommendation by id
   * @param id
   */
  public async get(id: string): Promise<DatabaseRecommendation> {
    this.logger.log(`Getting recommendation with id: ${id}`);
    const entity = await this.repository.findOneBy({ id });
    const model = plainToClass(DatabaseRecommendation, entity);

    if (!model) {
      this.logger.error(`Not found recommendation with id: ${id}'`);
      return null;
    }

    this.logger.log(`Succeed to get recommendation with id: ${id}'`);
    return model;
  }

  /**
   * Sync db analysis recommendations with live recommendations
   * @param clientMetadata
   * @param dbAnalysisRecommendations
   * @param liveRecommendations
   */
  async sync(
    clientMetadata: ClientMetadata,
    dbAnalysisRecommendations: Recommendation[],
  ): Promise<void> {
    this.logger.log('Synchronization of recommendations');
    try {
      const sortedRecommendations = sortRecommendations(dbAnalysisRecommendations);
      for (let i = 0; i < sortedRecommendations.length; i += 1) {
        if (!await this.isExist(clientMetadata, sortedRecommendations[i].name)) {
          await this.create(clientMetadata, sortedRecommendations[i].name);
        }
      }
    } catch (e) {
      // ignore errors
      this.logger.error(e);
    }
  }

  /**
   * Delete recommendation by id
   * @param clientMetadata,
   * @param id
   */
  public async delete({ databaseId }: ClientMetadata, id: string): Promise<void> {
    try {
      const { affected } = await this.repository.delete({ databaseId, id });

      if (!affected) {
        this.logger.error(`Recommendation with id:${id} was not Found`);
        throw new NotFoundException(ERROR_MESSAGES.DATABASE_RECOMMENDATION_NOT_FOUND);
      }

      this.logger.log('Succeed to delete recommendation.');
    } catch (error) {
      this.logger.error(`Failed to delete recommendation: ${id}`, error);
      throw new InternalServerErrorException(error.message);
    }
  }
}
