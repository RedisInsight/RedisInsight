import { Injectable } from '@nestjs/common';
import { Redis, Cluster, Command } from 'ioredis';
import { get } from 'lodash';
import { convertRedisInfoReplyToObject, convertBulkStringsToObject } from 'src/utils';
import { RedisDataType } from 'src/modules/browser/dto';
import { Recommendation } from 'src/modules/database-analysis/models/recommendation';
import { Key } from 'src/modules/database-analysis/models';

const minNumberOfCachedScripts = 10;
const maxHashLength = 5000;
const maxStringLength = 200;
const maxDatabaseTotal = 1_000_000;

@Injectable()
export class RecommendationProvider {
  /**
   * Check lua script recommendation
   * @param redisClient
   */
  async determineLuaScriptRecommendation(
    redisClient: Redis,
  ): Promise<Recommendation> {
    const info = convertRedisInfoReplyToObject(
      await redisClient.sendCommand(
        new Command('info', [], { replyEncoding: 'utf8' }),
      ) as string,
    );
    const nodesNumbersOfCachedScripts = get(info, 'memory.number_of_cached_scripts');

    return parseInt(nodesNumbersOfCachedScripts, 10) > minNumberOfCachedScripts
      ? { name: 'luaScript' }
      : null;
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
    const info = convertRedisInfoReplyToObject(
      await redisClient.info(),
    );
    const keyspace = get(info, 'keyspace', {});
    const databasesWithKeys = Object.values(keyspace).filter((db) => {
      const { keys } = convertBulkStringsToObject(db as string, ',', '=');
      return keys > 0;
    });
    return databasesWithKeys.length > 1 ? { name: 'avoidLogicalDatabases' } : null;
  }

  /**
   * Check combine small strings to hashes recommendation
   * @param keys
   */
  async determineCombineSmallStringsToHashesRecommendation(
    keys: Key[],
  ): Promise<Recommendation> {
    const smallString = keys.some((key) => key.type === RedisDataType.String && key.memory < maxStringLength);
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
    const [, setMaxIntsetEntries] = await redisClient.sendCommand(
      new Command('config', ['get', 'set-max-intset-entries'], {
        replyEncoding: 'utf8',
      }),
    ) as string[];

    if (!setMaxIntsetEntries) {
      return null;
    }

    const bigSet = keys.some((key) => key.type === RedisDataType.Set && key.length > parseInt(setMaxIntsetEntries, 10));
    return bigSet ? { name: 'increaseSetMaxIntsetEntries' } : null;
  }
}
