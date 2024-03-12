import { Injectable } from '@nestjs/common';
import { getTotalKeys } from 'src/modules/redis/utils';
import { KeyInfoProvider } from 'src/modules/database-analysis/scanner/key-info/key-info.provider';
import { RedisClient, RedisClientConnectionType, RedisClientNodeRole } from 'src/modules/redis/client';

@Injectable()
export class KeysScanner {
  constructor(
    private readonly keyInfoProvider: KeyInfoProvider,
  ) {}

  async scan(client: RedisClient, opts: any) {
    let nodes = [];

    if (client.getConnectionType() === RedisClientConnectionType.CLUSTER) {
      nodes = await client.nodes(RedisClientNodeRole.PRIMARY);
    } else {
      nodes = [client];
    }

    return Promise.all(nodes.map((node) => this.nodeScan(node, opts)));
  }

  async nodeScan(client: RedisClient, opts: any) {
    const total = await getTotalKeys(client);
    let indexes: string[];
    let libraries: string[];

    try {
      indexes = await client.sendCommand(
        ['FT._LIST'],
        { replyEncoding: 'utf8' },
      ) as string[];
    } catch (err) {
      // Ignore errors
    }

    try {
      libraries = await client.sendCommand(
        ['TFUNCTION', 'LIST'],
        { replyEncoding: 'utf8' },
      ) as string[];
    } catch (err) {
      // Ignore errors
    }

    const [
      ,
      keys,
    ] = await client.sendCommand([
      'scan', 0, ...opts.filter.getScanArgsArray(),
    ]) as [string, Buffer[]];

    const [sizes, types, ttls] = await Promise.all([
      client.sendPipeline(
        keys.map((key) => ([
          'memory',
          'usage',
          key,
          'samples',
          '0',
        ])),
      ),
      client.sendPipeline(
        keys.map((key) => (['type', key])),
        { replyEncoding: 'utf8' },
      ),
      client.sendPipeline(
        keys.map((key) => (['ttl', key])),
      ),
    ]);

    const lengths = await Promise.all(keys.map(async (key, i) => {
      const strategy = this.keyInfoProvider.getStrategy(types[i][1] as string);
      return strategy.getLengthSafe(client, key);
    }));

    const nodeKeys = [];
    for (let i = 0; i < keys.length; i += 1) {
      nodeKeys.push({
        name: keys[i],
        memory: sizes[i][0] ? null : sizes[i][1],
        length: lengths[i],
        type: types[i][0] ? 'N/A' : types[i][1],
        ttl: ttls[i][0] ? -2 : ttls[i][1],
      });
    }

    return {
      keys: nodeKeys,
      indexes,
      libraries,
      progress: {
        total,
        scanned: opts.filter.count,
        processed: nodeKeys.length,
      },
      client,
    };
  }
}
