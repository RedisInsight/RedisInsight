import { sortBy } from 'lodash';
import { REDISEARCH_MODULES, REDIS_STACK, RECOMMENDATION_NAMES } from 'src/constants';
import { AdditionalRedisModule } from 'src/modules/database/models/additional.redis.module';

export const isRedisearchModule = (modules: AdditionalRedisModule[]): boolean => modules?.some(
  ({ name }) => REDISEARCH_MODULES.some((search) => name === search),
);

export const sortRecommendations = (recommendations: any[]) => sortBy(recommendations, [
  ({ name }) => name !== RECOMMENDATION_NAMES.SEARCH_JSON,
  ({ name }) => name !== RECOMMENDATION_NAMES.SEARCH_INDEXES,
  ({ name }) => !REDIS_STACK.includes(name),
  ({ name }) => name,
]);
