import { IRecommendationStrategy, IDatabaseRecommendationStrategyData }
  from 'src/modules/database-recommendation/scanner/recommendation.strategy.interface';
import { Redis } from 'ioredis';

export abstract class AbstractRecommendationStrategy implements IRecommendationStrategy {
  abstract isRecommendationReached(data: any, client?: Redis): Promise<IDatabaseRecommendationStrategyData>;
}
