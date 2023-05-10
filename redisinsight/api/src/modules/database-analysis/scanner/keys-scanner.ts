import { Redis, Cluster, Command } from 'ioredis';
import { Injectable } from '@nestjs/common';
import { getTotal } from 'src/modules/database/utils/database.total.util';
import { KeyInfoProvider } from 'src/modules/database-analysis/scanner/key-info/key-info.provider';

@Injectable()
export class KeysScanner {
  constructor(
    private readonly keyInfoProvider: KeyInfoProvider,
  ) {}

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
    const total = await getTotal(client);
    let indexes;

    try {
      indexes = await client.sendCommand(
        new Command('FT._LIST', [], { replyEncoding: 'utf8' }),
      ) as string[];
    } catch (err) {
      // Ignore errors
    }

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
      progress: {
        total,
        scanned: opts.filter.count,
        processed: nodeKeys.length,
      },
      client,
    };
  }
}
