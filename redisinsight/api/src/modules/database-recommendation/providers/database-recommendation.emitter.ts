import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { DatabaseRecommendation } from 'src/modules/database-recommendation/models';
import { RecommendationEvents, RecommendationServerEvents } from 'src/modules/database-recommendation/constants';
import {
  DatabaseRecommendationsResponse,
} from 'src/modules/database-recommendation/dto/database-recommendations.response';
import {
  DatabaseRecommendationEntity,
} from 'src/modules/database-recommendation/entities/database-recommendation.entity';

@Injectable()
export class DatabaseRecommendationEmitter {
  private logger: Logger = new Logger('DatabaseRecommendationEmitter');

  constructor(
    @InjectRepository(DatabaseRecommendationEntity)
    private readonly repository: Repository<DatabaseRecommendationEntity>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @OnEvent(RecommendationEvents.NewRecommendation)
  async newRecommendation(recommendations: DatabaseRecommendation[]) {
    try {
      if (!recommendations?.length) {
        return;
      }

      this.logger.debug(`${recommendations.length} new recommendation(s) to emit`);

      const totalUnread = await this.repository
        .createQueryBuilder()
        .where({ read: false, databaseId: recommendations[0].databaseId })
        .getCount();

      this.eventEmitter.emit(
        RecommendationServerEvents.Recommendation,
        recommendations[0].databaseId,
        plainToClass(
          DatabaseRecommendationsResponse,
          {
            totalUnread,
            recommendations,
          },
        ),
      );
    } catch (e) {
      this.logger.error('Unable to prepare dto for recommendations', e);
      // ignore error
    }
  }
}
