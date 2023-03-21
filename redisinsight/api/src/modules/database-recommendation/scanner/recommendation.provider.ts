import { Injectable } from '@nestjs/common';
import { IRecommendationStrategy } from
  'src/modules/database-recommendation/scanner/recommendation.strategy.interface';
import { RECOMMENDATION_NAMES } from 'src/constants';
import { DatabaseService } from 'src/modules/database/database.service';
import {
  DefaultRecommendationStrategy,
  RediSearchStrategy,
} from 'src/modules/database-recommendation/scanner/strategies';

@Injectable()
export class RecommendationProvider {
  private strategies: Map<string, IRecommendationStrategy> = new Map();

  constructor(
    databaseService: DatabaseService,
  ) {
    this.strategies.set('default', new DefaultRecommendationStrategy());
    this.strategies.set(RECOMMENDATION_NAMES.SEARCH_STRING, new RediSearchStrategy(databaseService));
  }

  getStrategy(type: string): IRecommendationStrategy {
    const strategy = this.strategies.get(type);

    if (!strategy) {
      return this.strategies.get('default');
    }

    return strategy;
  }
}
