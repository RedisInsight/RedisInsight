import { Injectable, Logger } from '@nestjs/common';
import { Redis, Cluster, Command } from 'ioredis';
import { get, isNumber } from 'lodash';
import { isValid } from 'date-fns';
import * as semverCompare from 'node-version-compare';
import { convertRedisInfoReplyToObject, convertBulkStringsToObject } from 'src/utils';
import {
  RECOMMENDATION_NAMES, IS_TIMESTAMP, IS_INTEGER_NUMBER_REGEX, IS_NUMBER_REGEX,
} from 'src/constants';
import { RedisDataType } from 'src/modules/browser/dto';
import { Recommendation } from 'src/modules/database-analysis/models/recommendation';
import { Key } from 'src/modules/database-analysis/models';
import { RedisString } from 'src/common/constants';

const minNumberOfCachedScripts = 10;
const maxHashLength = 5_000;
const maxStringMemory = 200;
const maxDatabaseTotal = 1_000_000;
const maxCompressHashLength = 1_000;
const maxListLength = 1_000;
const maxHashCount = 50;
const minHashLength = 2;
const maxSetLength = 100_000;
const maxConnectedClients = 100;
const bigStringMemory = 5_000_000;
const sortedSetCountForCheck = 100;
const minRedisVersion = '6';

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
      const bigHash = keys.find((key) => key.type === RedisDataType.Hash && key.length > maxHashLength);
      return bigHash ? { name: RECOMMENDATION_NAMES.BIG_HASHES, params: { keys: [bigHash.name] } } : null;
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
      const smallString = keys.find((key) => key.type === RedisDataType.String && key.memory < maxStringMemory);
      return smallString
        ? { name: RECOMMENDATION_NAMES.COMBINE_SMALL_STRINGS_TO_HASHES, params: { keys: [smallString.name] } }
        : null;
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
      const bigSet = keys.find((key) => key.type === RedisDataType.Set && key.length > setMaxIntsetEntriesNumber);
      return bigSet
        ? { name: RECOMMENDATION_NAMES.INCREASE_SET_MAX_INTSET_ENTRIES, params: { keys: [bigSet.name] } }
        : null;
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

  async determineHashHashtableToZiplistRecommendation(
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
      const bigHash = keys.find((key) => key.type === RedisDataType.Hash && key.length > hashMaxZiplistEntriesNumber);
      return bigHash
        ? { name: RECOMMENDATION_NAMES.HASH_HASHTABLE_TO_ZIPLIST, params: { keys: [bigHash.name] } }
        : null;
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
      const bigHash = keys.find((key) => key.type === RedisDataType.Hash && key.length > maxCompressHashLength);
      return bigHash
        ? { name: RECOMMENDATION_NAMES.COMPRESS_HASH_FIELD_NAMES, params: { keys: [bigHash.name] } }
        : null;
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
      const bigList = keys.find((key) => key.type === RedisDataType.List && key.length > maxListLength);
      return bigList ? { name: RECOMMENDATION_NAMES.COMPRESSION_FOR_LIST, params: { keys: [bigList.name] } } : null;
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
      const bigString = keys.find((key) => key.type === RedisDataType.String && key.memory > bigStringMemory);
      return bigString
        ? { name: RECOMMENDATION_NAMES.BIG_STRINGS, params: { keys: [bigString.name] } }
        : null;
    } catch (err) {
      this.logger.error('Can not determine Big strings recommendation', err);
      return null;
    }
  }

  /**
 * Check zSet hashtable to ziplist recommendation
 * @param keys
 * @param redisClient
 */

  async determineZSetHashtableToZiplistRecommendation(
    redisClient: Redis | Cluster,
    keys: Key[],
  ): Promise<Recommendation> {
    try {
      const [, zSetMaxZiplistEntries] = await redisClient.sendCommand(
        new Command('config', ['get', 'zset-max-ziplist-entries'], {
          replyEncoding: 'utf8',
        }),
      ) as string[];
      const zSetMaxZiplistEntriesNumber = parseInt(zSetMaxZiplistEntries, 10);
      const bigHash = keys.find((key) => key.type === RedisDataType.ZSet && key.length > zSetMaxZiplistEntriesNumber);
      return bigHash
        ? { name: RECOMMENDATION_NAMES.ZSET_HASHTABLE_TO_ZIPLIST, params: { keys: [bigHash.name] } }
        : null;
    } catch (err) {
      this.logger.error('Can not determine ZSet hashtable to ziplist recommendation', err);
      return null;
    }
  }

  /**
 * Check big sets recommendation
 * @param keys
 */

  async determineBigSetsRecommendation(
    keys: Key[],
  ): Promise<Recommendation> {
    try {
      const bigSet = keys.find((key) => key.type === RedisDataType.Set && key.length > maxSetLength);
      return bigSet ? { name: RECOMMENDATION_NAMES.BIG_SETS, params: { keys: [bigSet.name] } } : null;
    } catch (err) {
      this.logger.error('Can not determine Big sets recommendation', err);
      return null;
    }
  }

  /**
 * Check big connected clients recommendation
 * @param redisClient
 */

  async determineConnectionClientsRecommendation(
    redisClient: Redis | Cluster,
  ): Promise<Recommendation> {
    try {
      const info = convertRedisInfoReplyToObject(
        await redisClient.sendCommand(
          new Command('info', ['clients'], { replyEncoding: 'utf8' }),
        ) as string,
      );
      const connectedClients = parseInt(get(info, 'clients.connected_clients'), 10);

      return connectedClients > maxConnectedClients
        ? { name: RECOMMENDATION_NAMES.BIG_AMOUNT_OF_CONNECTED_CLIENTS } : null;
    } catch (err) {
      this.logger.error('Can not determine Connection clients recommendation', err);
      return null;
    }
  }

  /**
   * Check RTS recommendation
   * @param redisClient
   * @param keys
   */

  async determineRTSRecommendation(
    redisClient: Redis | Cluster,
    keys: Key[],
  ): Promise<Recommendation> {
    try {
      let processedKeysNumber = 0;
      let timeSeriesKey = null;
      let sortedSetNumber = 0;
      while (
        processedKeysNumber < keys.length
        && !timeSeriesKey
        && sortedSetNumber <= sortedSetCountForCheck
      ) {
        if (keys[processedKeysNumber].type !== RedisDataType.ZSet) {
          processedKeysNumber += 1;
        } else {
          const [, membersArray] = await redisClient.sendCommand(
            // get first member-score pair
            new Command('zscan', [keys[processedKeysNumber].name, '0', 'COUNT', 2], { replyEncoding: 'utf8' }),
          ) as string[];
          if (this.checkTimestamp(membersArray[0]) || this.checkTimestamp(membersArray[1])) {
            timeSeriesKey = keys[processedKeysNumber].name;
          }
          processedKeysNumber += 1;
          sortedSetNumber += 1;
        }
      }

      return timeSeriesKey ? { name: RECOMMENDATION_NAMES.RTS, params: { keys: [timeSeriesKey] } } : null;
    } catch (err) {
      this.logger.error('Can not determine RTS recommendation', err);
      return null;
    }
  }

  /**
   * Check search JSON recommendation
   * @param keys
   * @param indexes
   */
  async determineSearchJSONRecommendation(
    keys: Key[],
    indexes?: string[],
  ): Promise<Recommendation> {
    try {
      if (indexes?.length) {
        return null;
      }
      const jsonKey = keys.find((key) => key.type === RedisDataType.JSON);

      return jsonKey ? { name: RECOMMENDATION_NAMES.SEARCH_JSON, params: { keys: [jsonKey.name] } } : null;
    } catch (err) {
      this.logger.error('Can not determine search json recommendation', err);
      return null;
    }
  }

  /**
   * Check redis version recommendation
   * @param redisClient
   */

  async determineRedisVersionRecommendation(
    redisClient: Redis | Cluster,
  ): Promise<Recommendation> {
    try {
      const info = convertRedisInfoReplyToObject(
        await redisClient.sendCommand(
          new Command('info', ['server'], { replyEncoding: 'utf8' }),
        ) as string,
      );
      const version = get(info, 'server.redis_version');
      return semverCompare(version, minRedisVersion) >= 0 ? null : { name: RECOMMENDATION_NAMES.REDIS_VERSION };
    } catch (err) {
      this.logger.error('Can not determine redis version recommendation', err);
      return null;
    }
  }

  /**
   * Check set password recommendation
   * @param redisClient
   */

  async determineSetPasswordRecommendation(
    redisClient: Redis | Cluster,
  ): Promise<Recommendation> {
    if (await this.checkAuth(redisClient)) {
      return { name: RECOMMENDATION_NAMES.SET_PASSWORD };
    }

    try {
      const users = await redisClient.sendCommand(
        new Command('acl', ['list'], { replyEncoding: 'utf8' }),
      ) as string[];

      const nopassUser = users.some((user) => user.split(' ')[3] === 'nopass');

      return nopassUser ? { name: RECOMMENDATION_NAMES.SET_PASSWORD } : null;
    } catch (err) {
      this.logger.error('Can not determine set password recommendation', err);
      return null;
    }
  }

  /**
   * Check search hash recommendation
   * @param keys
   * @param indexes
   */

  async determineSearchHashRecommendation(
    keys: Key[],
    indexes?: string[],
  ): Promise<Recommendation> {
    try {
      if (indexes?.length) {
        return null;
      }
      const hashKeys = keys.filter(({ type, length }) =>
        type === RedisDataType.Hash && length > minHashLength
      );

      return hashKeys.length > maxHashCount
        ? { name: RECOMMENDATION_NAMES.SEARCH_HASH }
        : null;
    } catch (err) {
      this.logger.error('Can not determine search hash recommendation', err);
      return null;
    }
  }

  /**
  * Check search indexes recommendation
   * @param redisClient
   * @param keys
   * @param client
   */
  // eslint-disable-next-line
  async determineSearchIndexesRecommendation(
    redisClient: Redis,
    keys: Key[],
    client: Redis | Cluster,
  ): Promise<Recommendation> {
    try {
      if (client.isCluster) {
        const res = await this.determineSearchIndexesForCluster(keys, client);
        return res ? { name: RECOMMENDATION_NAMES.SEARCH_INDEXES, params: { keys: [res] } } : null;
      }
      const res = await this.determineSearchIndexesForStandalone(keys, redisClient);
      return res ? { name: RECOMMENDATION_NAMES.SEARCH_INDEXES, params: { keys: [res] } } : null;
    } catch (err) {
      this.logger.error('Can not determine search indexes recommendation', err);
      return null;
    }
  }

  private async checkAuth(redisClient: Redis | Cluster): Promise<boolean> {
    try {
      await redisClient.sendCommand(
        new Command('auth', ['pass']),
      );
    } catch (err) {
      if (err.message.includes('Client sent AUTH, but no password is set')) {
        return true;
      }
    }
    return false;
  }

  private checkTimestamp(value: string): boolean {
    try {
      if (!IS_NUMBER_REGEX.test(value) && isValid(new Date(value))) {
        return true;
      }
      const integerPart = parseInt(value, 10);
      if (!IS_TIMESTAMP.test(integerPart.toString())) {
        return false;
      }
      if (isNumber(value) || integerPart.toString().length === value.length) {
        return true;
      }
      // check part after separator
      const subPart = value.replace(integerPart.toString(), '');
      return IS_INTEGER_NUMBER_REGEX.test(subPart.substring(1, subPart.length));
    } catch (err) {
      // ignore errors
      return false;
    }
  }

  private async determineSearchIndexesForCluster(keys: Key[], client: Redis | Cluster): Promise<RedisString> {
    let processedKeysNumber = 0;
    let keyName;
    let sortedSetNumber = 0;
    while (
      processedKeysNumber < keys.length
      && !keyName
      && sortedSetNumber <= sortedSetCountForCheck
    ) {
      if (keys[processedKeysNumber].type !== RedisDataType.ZSet) {
        processedKeysNumber += 1;
      } else {
        const sortedSetMember = await client.sendCommand(
          new Command('zrange', [keys[processedKeysNumber].name, 0, 0], { replyEncoding: 'utf8' }),
        ) as string[];
        const keyType = await client.sendCommand(
          new Command('type', [sortedSetMember[0]], { replyEncoding: 'utf8' }),
        ) as string;
        if (keyType === RedisDataType.JSON || keyType === RedisDataType.Hash) {
          keyName = keys[processedKeysNumber].name;
        }
        processedKeysNumber += 1;
        sortedSetNumber += 1;
      }
    }
    return keyName;
  }

  private async determineSearchIndexesForStandalone(keys: Key[], redisClient: Redis): Promise<RedisString> {
    const sortedSets = keys
      .filter(({ type }) => type === RedisDataType.ZSet)
      .slice(0, 100);
    const res = await redisClient.pipeline(sortedSets.map(({ name }) => ([
      'zrange',
      name,
      0,
      0,
    ]))).exec();

    const types = await redisClient.pipeline(res.map(([, member]) => ([
      'type',
      member,
    ]))).exec();

    const keyIndex = types.findIndex(([, type]) => type === RedisDataType.JSON || type === RedisDataType.Hash);

    return keyIndex === -1 ? undefined : sortedSets[keyIndex].name;
  }
}
