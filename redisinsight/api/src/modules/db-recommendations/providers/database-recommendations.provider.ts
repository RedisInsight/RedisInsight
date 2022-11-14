import { Injectable } from '@nestjs/common';
import { Redis, Cluster, Command } from 'ioredis';
import { get, max } from 'lodash';
import { IFindRedisClientInstanceByOptions } from 'src/modules/redis/redis.service';
// import { DatabaseConnectionService } from 'src/modules/database/database-connection.service';
import { convertRedisInfoReplyToObject } from 'src/utils';
import { AppTool } from 'src/models';

const minNumberOfCachedScripts = 10;

@Injectable()
export class RecommendationsService {
  // number of cached,
  // current cached scripts from info

  // second func determint
  // redis client (or info)
  // constructor(
  //   private readonly databaseConnectionService: DatabaseConnectionService,
  // ) {}

  /**
   * Get database recommendations
   * @param redisClient
   */
  public async getRecommendations(
    redisClient: Redis,
    // { client?, keys?, info?, etc }
    // clientOptions: IFindRedisClientInstanceByOptions,
  ) {
    const recommendations = [];
    if (await this.getLuaScriptRecommendation(redisClient)) {
      recommendations.push({ name: 'luaScript' });
    }

    return recommendations;
  }

  /**
   * Check lua script recommendation
   * @param redisClient
   */
  async getLuaScriptRecommendation(
    // clientOptions: IFindRedisClientInstanceByOptions,
    redisClient: Redis,
  ): Promise<boolean> {
    // let nodes = [];
    // const client = await this.databaseConnectionService.createClient({
    //   databaseId: clientOptions.instanceId,
    //   namespace: AppTool.Common,
    // });

    // if (client instanceof Cluster) {
    //   nodes = client.nodes('master');
    // } else {
    //   nodes = [client];
    // }

    // const nodesNumbersOfCachedScripts = Promise.all(nodes.map(async (node) => {
    //   const info = convertRedisInfoReplyToObject(
    //     await node.sendCommand(
    //       new Command('info', ['memory'], { replyEncoding: 'utf8' }),
    //     ) as string,
    //   );
    //   return get(info, 'memory.number_of_cached_scripts', {});
    // }));

    const info = convertRedisInfoReplyToObject(
      await redisClient.sendCommand(
        new Command('info', ['memory'], { replyEncoding: 'utf8' }),
      ) as string,
    );
    const nodesNumbersOfCachedScripts = get(info, 'memory.number_of_cached_scripts', {});

    return parseInt(await nodesNumbersOfCachedScripts, 10) < minNumberOfCachedScripts;
  }
}
