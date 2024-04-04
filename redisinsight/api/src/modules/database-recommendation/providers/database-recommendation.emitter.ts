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
import { DatabaseRecommendationRepository } from '../repositories/database-recommendation.repository';
import { ClientMetadata } from 'src/common/models';

@Injectable()
export class DatabaseRecommendationEmitter {
  private logger: Logger = new Logger('DatabaseRecommendationEmitter');

  constructor(
    private readonly databaseRecommendationRepository: DatabaseRecommendationRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @OnEvent(RecommendationEvents.NewRecommendation)
  async newRecommendation(recommendations: DatabaseRecommendation[]) {
    try {
      if (!recommendations?.length) {
        return;
      }

      this.logger.debug(`${recommendations.length} new recommendation(s) to emit`);

      // TODO: [USER_CONTEXT] how to get a client metadata here? do we even need it since it isn't used to grab the database id?
      const totalUnread = await this.databaseRecommendationRepository.getTotalUnread({} as ClientMetadata, recommendations[0].databaseId);

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
