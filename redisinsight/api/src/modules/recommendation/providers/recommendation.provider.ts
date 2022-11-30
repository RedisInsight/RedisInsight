import { Injectable } from '@nestjs/common';
import { Redis, Cluster, Command } from 'ioredis';
import { get } from 'lodash';
import { convertRedisInfoReplyToObject, convertBulkStringsToObject } from 'src/utils';
import { RedisDataType } from 'src/modules/browser/dto';
import { Recommendation } from 'src/modules/database-analysis/models/recommendation';
import { Key } from 'src/modules/database-analysis/models';

const minNumberOfCachedScripts = 10;
const maxHashLength = 5000;
const maxStringMemory = 200;
const maxDatabaseTotal = 1_000_000;
const maxCompressHashLength = 1000;

@Injectable()
export class RecommendationProvider {
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
          new Command('info', [], { replyEncoding: 'utf8' }),
        ) as string,
      );
      const nodesNumbersOfCachedScripts = get(info, 'memory.number_of_cached_scripts');

      return parseInt(nodesNumbersOfCachedScripts, 10) > minNumberOfCachedScripts
        ? { name: 'luaScript' }
        : null;
    } catch (err) {
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
    const bigHashes = keys.some((key) => key.type === RedisDataType.Hash && key.length > maxHashLength);
    return bigHashes ? { name: 'bigHashes' } : null;
  }

  /**
   * Check big hashes recommendation
   * @param total
   */
  async determineBigTotalRecommendation(
    total: number,
  ): Promise<Recommendation> {
    return total > maxDatabaseTotal ? { name: 'useSmallerKeys' } : null;
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
      return databasesWithKeys.length > 1 ? { name: 'avoidLogicalDatabases' } : null;
    } catch (err) {
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
    const smallString = keys.some((key) => key.type === RedisDataType.String && key.memory < maxStringMemory);
    return smallString ? { name: 'combineSmallStringsToHashes' } : null;
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
      return bigSet ? { name: 'increaseSetMaxIntsetEntries' } : null;
    } catch (err) {
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
      return bigHash ? { name: 'convertHashtableToZiplist' } : null;
    } catch (err) {
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
    const bigHash = keys.some((key) => key.type === RedisDataType.Hash && key.length > maxCompressHashLength);
    return bigHash ? { name: 'compressHashFieldNames' } : null;
  }
}
