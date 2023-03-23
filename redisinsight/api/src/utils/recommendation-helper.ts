import { REDISEARCH_MODULES } from 'src/constants';
import { AdditionalRedisModule } from 'src/modules/database/models/additional.redis.module';

export const isRedisearchModule = (modules: AdditionalRedisModule[]): boolean =>
  modules?.some(({ name }) =>
    REDISEARCH_MODULES.some((search) => name === search))