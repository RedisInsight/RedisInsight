import { Injectable } from '@nestjs/common';
import { Redis, Cluster } from 'ioredis';
import { difference } from 'lodash';
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
  globalClient?: Redis | Cluster,
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
      globalClient,
      exclude,
    } = dto;

    const recommendations = new Map([
      [
        RECOMMENDATION_NAMES.LUA_SCRIPT,
        async () => await this.recommendationProvider.determineLuaScriptRecommendation(client),
      ],
      [
        RECOMMENDATION_NAMES.BIG_HASHES,
        async () => await this.recommendationProvider.determineBigHashesRecommendation(keys),
      ],
      [
        RECOMMENDATION_NAMES.USE_SMALLER_KEYS,
        async () => await this.recommendationProvider.determineBigTotalRecommendation(total),
      ],
      [
        RECOMMENDATION_NAMES.AVOID_LOGICAL_DATABASES,
        async () => await this.recommendationProvider.determineLogicalDatabasesRecommendation(client),
      ],
      [
        RECOMMENDATION_NAMES.COMBINE_SMALL_STRINGS_TO_HASHES,
        async () => await this.recommendationProvider.determineCombineSmallStringsToHashesRecommendation(keys),
      ],
      [
        RECOMMENDATION_NAMES.INCREASE_SET_MAX_INTSET_ENTRIES,
        async () => await this.recommendationProvider.determineIncreaseSetMaxIntsetEntriesRecommendation(client, keys),
      ],
      [
        RECOMMENDATION_NAMES.HASH_HASHTABLE_TO_ZIPLIST,
        async () => await this.recommendationProvider.determineHashHashtableToZiplistRecommendation(client, keys),
      ],
      [
        RECOMMENDATION_NAMES.COMPRESS_HASH_FIELD_NAMES,
        async () => await this.recommendationProvider.determineCompressHashFieldNamesRecommendation(keys),
      ],
      [
        RECOMMENDATION_NAMES.COMPRESSION_FOR_LIST,
        async () => await this.recommendationProvider.determineCompressionForListRecommendation(keys),
      ],
      [
        RECOMMENDATION_NAMES.BIG_STRINGS,
        async () => await this.recommendationProvider.determineBigStringsRecommendation(keys),
      ],
      [
        RECOMMENDATION_NAMES.ZSET_HASHTABLE_TO_ZIPLIST,
        async () => await this.recommendationProvider.determineZSetHashtableToZiplistRecommendation(client, keys),
      ],
      [
        RECOMMENDATION_NAMES.BIG_SETS,
        async () => await this.recommendationProvider.determineBigSetsRecommendation(keys),
      ],
      [
        RECOMMENDATION_NAMES.BIG_AMOUNT_OF_CONNECTED_CLIENTS,
        async () => await this.recommendationProvider.determineConnectionClientsRecommendation(client),
      ],
      [
        RECOMMENDATION_NAMES.RTS,
        async () => await this.recommendationProvider.determineRTSRecommendation(client, keys),
      ],
      [
        RECOMMENDATION_NAMES.REDIS_SEARCH,
        async () => await this.recommendationProvider.determineRediSearchRecommendation(client, keys),
      ],
      [
        RECOMMENDATION_NAMES.REDIS_VERSION,
        async () => await this.recommendationProvider.determineRedisVersionRecommendation(client),
      ],
      [
        RECOMMENDATION_NAMES.SEARCH_INDEXES,
        async () => await this.recommendationProvider.determineSearchIndexesRecommendation(client, keys, globalClient),
      ],
      [
        RECOMMENDATION_NAMES.SET_PASSWORD,
        async () => await this.recommendationProvider.determineSetPasswordRecommendation(client),
      ],
      // it is live time recommendation (will add later)
      [
        RECOMMENDATION_NAMES.SHARD_HASHES,
        () => null,
      ],
      [
        RECOMMENDATION_NAMES.AVOID_LOGICAL_DATABASES_LIVE,
        () => null,
      ],
      [
        RECOMMENDATION_NAMES.STRING_TO_JSON,
        () => null,
      ],
      [
        RECOMMENDATION_NAMES.INTEGERS_IN_SET,
        () => null,
      ],
      [
        RECOMMENDATION_NAMES.SEARCH_STRING,
        () => null,
      ],
      [
        RECOMMENDATION_NAMES.SEARCH_JSON,
        () => null,
      ],
    ]);

    const recommendationsToDetermine = difference(Object.values(RECOMMENDATION_NAMES), exclude);

    return (
      Promise.all(recommendationsToDetermine.map((recommendation) => recommendations.get(recommendation)())));
  }
}
