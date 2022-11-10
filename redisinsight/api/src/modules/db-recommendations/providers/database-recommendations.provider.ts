import { Injectable, Logger } from '@nestjs/common';
import { Cluster, Command } from 'ioredis';
import { get, max } from 'lodash';
import { IFindRedisClientInstanceByOptions } from 'src/modules/redis/redis.service';
import { DatabaseConnectionService } from 'src/modules/database/database-connection.service';
import { convertRedisInfoReplyToObject } from 'src/utils';
import { AppTool } from 'src/models';

const minNumberOfCachedScripts = 10;

@Injectable()
export class RecommendationsService {
  private logger = new Logger('DatabaseRecommendationsService');

  constructor(
    private readonly databaseConnectionService: DatabaseConnectionService,
  ) {}

  public async getRecommendations(
    clientOptions: IFindRedisClientInstanceByOptions,
  ) {
    const recommendations = [];
    if (await this.getLuaScriptRecommendation(clientOptions)) {
      recommendations.push({ name: 'luaScript' });
    }

    return recommendations;
  }

  async getLuaScriptRecommendation(
    clientOptions: IFindRedisClientInstanceByOptions,
  ): Promise<boolean> {
    let nodes = [];
    const client = await this.databaseConnectionService.createClient({
      databaseId: clientOptions.instanceId,
      namespace: AppTool.Common,
    });

    if (client instanceof Cluster) {
      nodes = client.nodes('master');
    } else {
      nodes = [client];
    }

    const nodesNumbersOfCachedScripts = Promise.all(nodes.map(async (node) => {
      const info = convertRedisInfoReplyToObject(
        await node.sendCommand(
          new Command('info', ['memory'], { replyEncoding: 'utf8' }),
        ) as string,
      );
      return get(info, 'memory.number_of_cached_scripts', {});
    }));

    return max(await nodesNumbersOfCachedScripts) > minNumberOfCachedScripts;
  }
}
