import { Injectable, Logger } from '@nestjs/common';
import { Redis, Cluster, Command } from 'ioredis';
import { get } from 'lodash';
import { convertRedisInfoReplyToObject, convertBulkStringsToObject } from 'src/utils';
import { RECOMMENDATION_NAMES } from 'src/constants';
import { RedisDataType } from 'src/modules/browser/dto';
import { Recommendation } from 'src/modules/database-analysis/models/recommendation';
import { Key } from 'src/modules/database-analysis/models';

const minNumberOfCachedScripts = 10;
const maxHashLength = 5000;
const maxStringMemory = 200;
const maxDatabaseTotal = 1_000_000;
const maxCompressHashLength = 1000;
const maxListLength = 1000;
const bigStringMemory = 5_000_000;

@Injectable()
export class RecommendationProvider {
  private logger = new Logger('RecommendationProvider');

  /**
   * Check lua script recommendation
   * @param redisClient
   */
  async determineLuaScriptRecommendation(
    redisClient: Redis,
  ): Promise<Recommendation> {
    try {
      const info = convertRedisInfoReplyToObject(
        await redisClient.sendCommand(
          new Command('info', ['memory'], { replyEncoding: 'utf8' }),
        ) as string,
      );
      const nodesNumbersOfCachedScripts = get(info, 'memory.number_of_cached_scripts');

      return parseInt(nodesNumbersOfCachedScripts, 10) > minNumberOfCachedScripts
        ? { name: RECOMMENDATION_NAMES.LUA_SCRIPT }
        : null;
    } catch (err) {
      this.logger.error('Can not determine Lua script recommendation', err);
      return null;
    }
  }

  /**
   * Check big hashes recommendation
   * @param keys
   */
  async determineBigHashesRecommendation(
    keys: Key[],
  ): Promise<Recommendation> {
    try {
      const bigHashes = keys.some((key) => key.type === RedisDataType.Hash && key.length > maxHashLength);
      return bigHashes ? { name: RECOMMENDATION_NAMES.BIG_HASHES } : null;
    } catch (err) {
      this.logger.error('Can not determine Big Hashes recommendation', err);
      return null;
    }
  }

  /**
   * Check use smaller keys recommendation
   * @param total
   */
  async determineBigTotalRecommendation(
    total: number,
  ): Promise<Recommendation> {
    return total > maxDatabaseTotal ? { name: RECOMMENDATION_NAMES.USE_SMALLER_KEYS } : null;
  }

  /**
   * Check logical databases recommendation
   * @param redisClient
   */
  async determineLogicalDatabasesRecommendation(
    redisClient: Redis | Cluster,
  ): Promise<Recommendation> {
    if (redisClient.isCluster) {
      return null;
    }
    try {
      const info = convertRedisInfoReplyToObject(
        await redisClient.sendCommand(
          new Command('info', ['keyspace'], { replyEncoding: 'utf8' }),
        ) as string,
      );
      const keyspace = get(info, 'keyspace', {});
      const databasesWithKeys = Object.values(keyspace).filter((db) => {
        const { keys } = convertBulkStringsToObject(db as string, ',', '=');
        return keys > 0;
      });
      return databasesWithKeys.length > 1 ? { name: RECOMMENDATION_NAMES.AVOID_LOGICAL_DATABASES } : null;
    } catch (err) {
      this.logger.error('Can not determine Logical database recommendation', err);
      return null;
    }
  }

  /**
   * Check combine small strings to hashes recommendation
   * @param keys
   */
  async determineCombineSmallStringsToHashesRecommendation(
    keys: Key[],
  ): Promise<Recommendation> {
    try {
      const smallString = keys.some((key) => key.type === RedisDataType.String && key.memory < maxStringMemory);
      return smallString ? { name: RECOMMENDATION_NAMES.COMBINE_SMALL_STRINGS_TO_HASHES } : null;
    } catch (err) {
      this.logger.error('Can not determine Combine small strings to hashes recommendation', err);
      return null;
    }
  }

  /**
   * Check increase set max intset entries recommendation
   * @param keys
   * @param redisClient
   */
  async determineIncreaseSetMaxIntsetEntriesRecommendation(
    redisClient: Redis | Cluster,
    keys: Key[],
  ): Promise<Recommendation> {
    try {
      const [, setMaxIntsetEntries] = await redisClient.sendCommand(
        new Command('config', ['get', 'set-max-intset-entries'], {
          replyEncoding: 'utf8',
        }),
      ) as string[];

      if (!setMaxIntsetEntries) {
        return null;
      }
      const setMaxIntsetEntriesNumber = parseInt(setMaxIntsetEntries, 10);
      const bigSet = keys.some((key) => key.type === RedisDataType.Set && key.length > setMaxIntsetEntriesNumber);
      return bigSet ? { name: RECOMMENDATION_NAMES.INCREASE_SET_MAX_INTSET_ENTRIES } : null;
    } catch (err) {
      this.logger.error('Can not determine Increase set max intset entries recommendation', err);
      return null;
    }
  }
  /**
   * Check convert hashtable to ziplist recommendation
   * @param keys
   * @param redisClient
   */

  async determineConvertHashtableToZiplistRecommendation(
    redisClient: Redis | Cluster,
    keys: Key[],
  ): Promise<Recommendation> {
    try {
      const [, hashMaxZiplistEntries] = await redisClient.sendCommand(
        new Command('config', ['get', 'hash-max-ziplist-entries'], {
          replyEncoding: 'utf8',
        }),
      ) as string[];
      const hashMaxZiplistEntriesNumber = parseInt(hashMaxZiplistEntries, 10);
      const bigHash = keys.some((key) => key.type === RedisDataType.Hash && key.length > hashMaxZiplistEntriesNumber);
      return bigHash ? { name: RECOMMENDATION_NAMES.CONVERT_HASHTABLE_TO_ZIPLIST } : null;
    } catch (err) {
      this.logger.error('Can not determine Convert hashtable to ziplist recommendation', err);
      return null;
    }
  }

  /**
   * Check compress hash field names recommendation
   * @param keys
   */
  async determineCompressHashFieldNamesRecommendation(
    keys: Key[],
  ): Promise<Recommendation> {
    try {
      const bigHash = keys.some((key) => key.type === RedisDataType.Hash && key.length > maxCompressHashLength);
      return bigHash ? { name: RECOMMENDATION_NAMES.COMPRESS_HASH_FIELD_NAMES } : null;
    } catch (err) {
      this.logger.error('Can not determine Compress hash field names recommendation', err);
      return null;
    }
  }

  /**
   * Check compression for list recommendation
   * @param keys
   */
  async determineCompressionForListRecommendation(
    keys: Key[],
  ): Promise<Recommendation> {
    try {
      const bigList = keys.some((key) => key.type === RedisDataType.List && key.length > maxListLength);
      return bigList ? { name: RECOMMENDATION_NAMES.COMPRESSION_FOR_LIST } : null;
    } catch (err) {
      this.logger.error('Can not determine Compression for list recommendation', err);
      return null;
    }
  }

  /**
 * Check big strings recommendation
 * @param keys
 */
  async determineBigStringsRecommendation(
    keys: Key[],
  ): Promise<Recommendation> {
    try {
      const bigString = keys.some((key) => key.type === RedisDataType.String && key.memory > bigStringMemory);
      return bigString ? { name: RECOMMENDATION_NAMES.BIG_STRINGS } : null;
    } catch (err) {
      this.logger.error('Can not determine Big strings recommendation', err);
      return null;
    }
  }
}
