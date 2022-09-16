import { Redis, Cluster, Command } from 'ioredis';
import { get } from 'lodash';
import { convertBulkStringsToObject, convertRedisInfoReplyToObject } from 'src/utils';

export class KeysScanner {
  async scan(client: Redis | Cluster, opts: any) {
    let nodes = [];

    if (client instanceof Cluster) {
      nodes = client.nodes('master');
    } else {
      nodes = [client];
    }

    return Promise.all(nodes.map((node) => this.nodeScan(node, opts)));
  }

  async nodeScan(client: Redis, opts: any) {
    const total = await this.getNodeTotal(client);

    const [
      ,
      keys,
    ] = await client.sendCommand(
      new Command('scan', [0, ...opts.filter.getScanArgsArray()]),
    ) as [string, Buffer[]];

    const [sizes, types, ttls] = await Promise.all([
      client.pipeline(keys.map((key) => ([
        'memory',
        'usage',
        key,
        'samples',
        '0',
      ]))).exec(),
      client.pipeline(keys.map((key) => ([
        'type',
        key,
      ]))).exec(),
      client.pipeline(keys.map((key) => ([
        'ttl',
        key,
      ]))).exec(),
    ]);

    const nodeKeys = [];
    for (let i = 0; i < keys.length; i += 1) {
      nodeKeys.push({
        name: keys[i],
        memory: sizes[i][0] ? 0 : sizes[i][1],
        length: sizes[i][1],
        type: types[i][0] ? 'N/A' : types[i][1],
        ttl: ttls[i][0] ? -1 : ttls[i][1],
      });
    }

    return {
      keys: nodeKeys,
      progress: {
        total,
        scanned: opts.filter.count,
        processed: nodeKeys.length,
      },
    };
  }

  async getNodeTotal(client: Redis): Promise<number> {
    const currentDbIndex = get(client, ['options', 'db'], 0);
    const info = convertRedisInfoReplyToObject(
      await client.sendCommand(new Command('info', ['keyspace'], {
        replyEncoding: 'utf8',
      })) as string,
    );

    const dbInfo = get(info, 'keyspace', {});
    if (!dbInfo[`db${currentDbIndex}`]) {
      return 0;
    }

    const { keys } = convertBulkStringsToObject(dbInfo[`db${currentDbIndex}`], ',', '=');
    return parseInt(keys, 10);
  }
}
