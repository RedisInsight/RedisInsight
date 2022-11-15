import { Injectable } from '@nestjs/common';
import { Redis, Command } from 'ioredis';
import { get } from 'lodash';
import { convertRedisInfoReplyToObject } from 'src/utils';

const minNumberOfCachedScripts = 10;

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
}
