import { Injectable } from '@nestjs/common';
import { Redis, Command } from 'ioredis';
import { get } from 'lodash';
import { convertRedisInfoReplyToObject } from 'src/utils';
import { RedisDataType } from 'src/modules/browser/dto';
import { Key } from 'src/modules/database-analysis/models';

const minNumberOfCachedScripts = 10;
const maxHashLength = 5000;
const maxDatabaseTotal = 1_000_000;

@Injectable()
export class RecommendationProvider {
  /**
   * Check lua script recommendation
   * @param redisClient
   */
  async determineLuaScriptRecommendation(
    redisClient: Redis,
  ): Promise<boolean> {
    const info = convertRedisInfoReplyToObject(
      await redisClient.sendCommand(
        new Command('info', [], { replyEncoding: 'utf8' }),
      ) as string,
    );
    const nodesNumbersOfCachedScripts = get(info, 'memory.number_of_cached_scripts');

    return parseInt(nodesNumbersOfCachedScripts, 10) > minNumberOfCachedScripts;
  }

  /**
   * Check big hashes recommendation
   * @param keys
   */
  async determineBigHashesRecommendation(
    keys: Key[],
  ): Promise<boolean> {
    const bigHashes = keys.filter((key) => key.type === RedisDataType.Hash && key.length > maxHashLength);
    return bigHashes.length > 0;
  }

  /**
   * Check big hashes recommendation
   * @param total
   */
  async determineBigTotalRecommendation(
    total: number,
  ): Promise<boolean> {
    return total > maxDatabaseTotal;
  }
}
