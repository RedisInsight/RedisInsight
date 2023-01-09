import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { RecommendationProvider } from 'src/modules/recommendation/providers/recommendation.provider';
import { Recommendation } from 'src/modules/database-analysis/models/recommendation';
import { RECOMMENDATION_NAMES } from 'src/constants';
import { RedisString } from 'src/common/constants';
import { Key } from 'src/modules/database-analysis/models';

interface RecommendationInput {
  client?: Redis,
  keys?: Key[],
  info?: RedisString,
  total?: number,
  exclude?: string[],
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
    const {
      client,
      keys,
      info,
      total,
      exclude,
    } = dto;

    return (
      Promise.all([
        await this.recommendationProvider.determineLuaScriptRecommendation(client),
        await this.recommendationProvider.determineBigHashesRecommendation(keys),
        await this.recommendationProvider.determineBigTotalRecommendation(total),
        await this.recommendationProvider.determineLogicalDatabasesRecommendation(client),
        await this.recommendationProvider.determineCombineSmallStringsToHashesRecommendation(keys),
        await this.recommendationProvider.determineIncreaseSetMaxIntsetEntriesRecommendation(client, keys),
        await this.recommendationProvider.determineHashHashtableToZiplistRecommendation(client, keys),
        await this.recommendationProvider.determineCompressHashFieldNamesRecommendation(keys),
        await this.recommendationProvider.determineCompressionForListRecommendation(keys),
        await this.recommendationProvider.determineBigStringsRecommendation(keys),
        await this.recommendationProvider.determineZSetHashtableToZiplistRecommendation(client, keys),
        await this.recommendationProvider.determineBigSetsRecommendation(keys),
        await this.recommendationProvider.determineConnectionClientsRecommendation(client),
        // TODO rework, need better solution to do not start determine recommendation
        exclude.includes(RECOMMENDATION_NAMES.RTS) ? null : await this.recommendationProvider.determineRTSRecommendation(client, keys),
        await this.recommendationProvider.determineRediSearchRecommendation(client, keys),
        await this.recommendationProvider.determineRedisVersionRecommendation(client),        
        await this.recommendationProvider.determineSetPasswordRecommendation(client),
      ]));
  }
}
