import { RedisString } from 'src/common/constants';
import { IsRedisString, RedisStringType } from 'src/common/decorators';

export interface DatabaseRecommendationParams {
  id?: string;
  name?: string;
  value?: string | number | boolean;
  type?: string;
  keys?: RedisString[];
}

export class DatabaseRecommendationParamsDto {
  @IsRedisString({ each: true })
  @RedisStringType({ each: true })
  keys?: RedisString[];
}