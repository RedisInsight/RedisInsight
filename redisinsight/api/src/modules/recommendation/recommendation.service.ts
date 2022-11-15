import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { RecommendationProvider } from 'src/modules/recommendation/providers/recommendation.provider';
import { Recommendation } from 'src/modules/database-analysis/models/recommendation';
import { RedisString } from 'src/common/constants';

interface RecommendationInput {
  client?: Redis,
  keys?: RedisString[],
  info?: RedisString,
}

@Injectable()
export class RecommendationService {
  constructor(
    private readonly recommendationProvider: RecommendationProvider,
  ) {}

  /**
   * Get recommendations
   * @param dto
   */
  public async getRecommendations(
    dto: RecommendationInput,
  ): Promise<Recommendation[]> {
    // generic solution, if somewhere we will sent info, we don't need determined some recommendations
    const { client, keys, info } = dto;
    const recommendations = [];
    // TODO refactor it
    if (await this.recommendationProvider.determineLuaScriptRecommendation(client)) {
      recommendations.push({ name: 'luaScript' });
    }
    return recommendations;
  }
}
