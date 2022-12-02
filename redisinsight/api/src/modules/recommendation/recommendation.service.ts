import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { RecommendationProvider } from 'src/modules/recommendation/providers/recommendation.provider';
import { Recommendation } from 'src/modules/database-analysis/models/recommendation';
import { RedisString } from 'src/common/constants';
import { Key } from 'src/modules/database-analysis/models';

interface RecommendationInput {
  client?: Redis,
  keys?: Key[],
  info?: RedisString,
  total?: number,
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
    } = dto;

    return (
      Promise.all([
        await this.recommendationProvider.determineLuaScriptRecommendation(client),
        await this.recommendationProvider.determineBigHashesRecommendation(keys),
        await this.recommendationProvider.determineBigTotalRecommendation(total),
        await this.recommendationProvider.determineLogicalDatabasesRecommendation(client),
        await this.recommendationProvider.determineCombineSmallStringsToHashesRecommendation(keys),
        await this.recommendationProvider.determineIncreaseSetMaxIntsetEntriesRecommendation(client, keys),
        await this.recommendationProvider.determineConvertHashtableToZiplistRecommendation(client, keys),
        await this.recommendationProvider.determineCompressHashFieldNamesRecommendation(keys),
        await this.recommendationProvider.determineCompressionForListRecommendation(keys),
      ]));
  }
}
