import { Injectable } from '@nestjs/common';
import { RedisClient, RedisClientNodeRole } from 'src/modules/redis/client';
import { uniq } from 'lodash';
import {
  convertIndexInfoReply, createRedisearchIndexesContextFromObjects,
} from 'src/modules/ai/query/utils/context.util';

@Injectable()
export class AiContextProvider {
  private async getAttributeTopValues(client: RedisClient, index: string, attribute: object): Promise<object> {
    try {
      switch (attribute['type'].toLowerCase()) {
        case 'text':
        case 'tag':
        case 'numeric':
        case 'geo':
          const [distinct, ...top] = await client.sendCommand([
            'FT.AGGREGATE',
            index,
            '*',
            'GROUPBY',
            '1',
            `@${attribute['attribute']}`,
            'REDUCE',
            'COUNT',
            '0',
            'AS',
            'count',
            'SORTBY',
            '2',
            '@count',
            'DESC',
            'MAX',
            '5',
          ], { replyEncoding: 'utf8' }) as [string, ...string[]];

          return {
            distinct_count: parseInt(distinct, 10),
            top_values: [top?.map(([, value, , count]) => ({ value, count }))],
          };
        default:
          return {};
      }
    } catch (e) {
      // ignore error
      return {};
    }
  }

  private async getRedisearchIndexes(client: RedisClient) {
    const nodes = await client.nodes(RedisClientNodeRole.PRIMARY);

    const res = await Promise.all(nodes.map(async (node) => node.sendCommand(
      ['FT._LIST'],
      {
        replyEncoding: 'utf8',
      },
    )));

    return uniq([].concat(...res));
  }

  async getDbContext(client: RedisClient, options: { topValues?: boolean } = {}): Promise<object> {
    try {
      const indexes = await this.getRedisearchIndexes(client);

      const indexesInfo = await Promise.all(indexes.map(async (index) => {
        const infoReply = await client.sendCommand(['ft.info', index], {
          replyEncoding: 'utf8',
        }) as string[];

        const info = convertIndexInfoReply(infoReply);

        if (options.topValues) {
          info['attributes'] = await Promise.all(info['attributes'].map(async (argument) => ({
            ...argument,
            ...(await this.getAttributeTopValues(client, info['index_name'], argument)),
          })));
        }

        return info;
      }));

      return createRedisearchIndexesContextFromObjects(indexesInfo);
    } catch (e) {
      // ignore errors
      return {};
    }
  }
}
