import { Injectable } from '@nestjs/common';
import { Redis, Command } from 'ioredis';
import { get } from 'lodash';
import { RedisString } from 'src/common/constants';
import { Recommendation } from 'src/modules/database-analysis/models/recommendation';
import { convertRedisInfoReplyToObject } from 'src/utils';
import { checkIsGreaterThan } from 'src/utils/base.helper';

const minNumberOfCachedScripts = 10;

interface RecommendationInput {
  client?: Redis,
  keys?: RedisString[],
  info?: RedisString,
}

@Injectable()
export class RecommendationService {
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
    if (await this.determineLuaScriptRecommendation(client)) {
      recommendations.push({ name: 'luaScript' });
    }
    return recommendations;
  }

  /**
   * Check lua script recommendation
   * @param redisClient
   */
  async determineLuaScriptRecommendation(
    redisClient: Redis,
  ): Promise<boolean> {
    const info = convertRedisInfoReplyToObject(
      await redisClient.sendCommand(
        new Command('info', ['memory'], { replyEncoding: 'utf8' }),
      ) as string,
    );
    const nodesNumbersOfCachedScripts = get(info, 'memory.number_of_cached_scripts', {});

    return checkIsGreaterThan(minNumberOfCachedScripts, parseInt(await nodesNumbersOfCachedScripts, 10));
  }
}
