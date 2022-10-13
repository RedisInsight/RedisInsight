import {
  toNumber, omit, isNull, get,
} from 'lodash';
import * as isGlob from 'is-glob';
import config from 'src/utils/config';
import { unescapeGlob, convertBulkStringsToObject } from 'src/utils';
import {
  BrowserToolClusterService,
} from 'src/modules/browser/services/browser-tool-cluster/browser-tool-cluster.service';
import { IFindRedisClientInstanceByOptions } from 'src/modules/core/services/redis/redis.service';
import { BrowserToolKeysCommands } from 'src/modules/browser/constants/browser-tool-commands';
import {
  GetKeyInfoResponse,
  GetKeysWithDetailsResponse,
  RedisDataType,
} from 'src/modules/browser/dto';
import { parseClusterCursor } from 'src/modules/browser/utils/clusterCursor';
import { SettingsService } from 'src/modules/settings/settings.service';
import { AbstractStrategy } from './abstract.strategy';
import { IGetNodeKeysResult } from '../scanner.interface';

const REDIS_SCAN_CONFIG = config.get('redis_scan');

export class ClusterStrategy extends AbstractStrategy {
  private readonly redisManager: BrowserToolClusterService;

  private settingsService: SettingsService;

  constructor(
    redisManager: BrowserToolClusterService,
    settingsService: SettingsService,
  ) {
    super(redisManager);
    this.redisManager = redisManager;
    this.settingsService = settingsService;
  }

  public async getKeys(
    clientOptions,
    args,
  ): Promise<GetKeysWithDetailsResponse[]> {
    const match = args.match !== undefined ? args.match : '*';
    const count = args.count || REDIS_SCAN_CONFIG.countDefault;
    const client = await this.redisManager.getRedisClient(clientOptions);
    const currentDbIndex = get(client, ['options', 'db'], 0);
    const nodes = await this.getNodesToScan(clientOptions, args.cursor);
    // todo: remove settings from here. threshold should be part of query?
    const settings = await this.settingsService.getAppSettings('1');
    await this.calculateNodesTotalKeys(clientOptions, currentDbIndex, nodes);

    if (!isGlob(match, { strict: false })) {
      const keyName = unescapeGlob(match);
      nodes.forEach((node) => {
        // eslint-disable-next-line no-param-reassign
        node.cursor = 0;
        // eslint-disable-next-line no-param-reassign
        node.scanned = isNull(node.total) ? 1 : node.total;
      });
      nodes[0].keys = [await this.getKeyInfo(client, keyName)];
      nodes[0].keys = nodes[0].keys.filter((key: GetKeyInfoResponse) => {
        if (key.ttl === -2) {
          return false;
        }
        if (args.type) {
          return key.type === args.type;
        }
        return true;
      });
      return nodes.map((node) => omit(node, 'node'));
    }

    let allNodesScanned = false;
    while (
      !allNodesScanned
      && nodes.reduce((prev, cur) => prev + cur.keys.length, 0) < count
      && (
        (
          nodes.reduce((prev, cur) => prev + cur.total, 0) < settings.scanThreshold
          && nodes.find((node) => !!node.cursor)
        )
        || nodes.reduce((prev, cur) => prev + cur.scanned, 0)
          < settings.scanThreshold
      )
    ) {
      await this.scanNodes(clientOptions, nodes, match, count, args.type);
      allNodesScanned = !nodes.some((node) => node.cursor !== 0);
    }

    await Promise.all(
      nodes.map(async (node) => {
        if (node.keys.length) {
          // eslint-disable-next-line no-param-reassign
          node.keys = await this.getKeysInfo(
            node.node,
            node.keys,
            args.type,
          );
        }
      }),
    );

    return nodes.map((node) => omit(node, 'node'));
  }

  private async getNodesToScan(
    clientOptions: IFindRedisClientInstanceByOptions,
    initialCursor: string,
  ): Promise<IGetNodeKeysResult[]> {
    const nodesClients = await this.redisManager.getNodes(
      clientOptions,
      'master',
    );

    if (Number.isNaN(toNumber(initialCursor))) {
      // parse existing cursor
      const nodes = parseClusterCursor(initialCursor);
      // add client to each node
      nodes.forEach((node, index) => {
        nodes[index].node = nodesClients.find(
          ({ options: { host, port } }) => host === node.host && port === node.port,
        );
      });

      return nodes;
    }

    return nodesClients.map((node) => ({
      node,
      host: node.options.host,
      port: node.options.port,
      cursor: 0,
      keys: [],
      total: 0,
      scanned: 0,
    }));
  }

  private async calculateNodesTotalKeys(
    clientOptions,
    currentDbIndex: number,
    nodes: IGetNodeKeysResult[],
  ): Promise<void> {
    await Promise.all(
      nodes.map(async (node) => {
        const result = await this.redisManager.execCommandFromNode(
          clientOptions,
          BrowserToolKeysCommands.InfoKeyspace,
          [],
          { host: node.host, port: node.port },
        );

        const info = convertBulkStringsToObject(result.result);

        if (!info[`db${currentDbIndex}`]) {
          node.total = 0;
        } else {
          const { keys } = convertBulkStringsToObject(info[`db${currentDbIndex}`], ',', '=');
          node.total = parseInt(keys, 10);
        }
      }),
    );
  }

  /**
   * Scan keys for each node and mutates input data
   */
  private async scanNodes(
    clientOptions,
    nodes: IGetNodeKeysResult[],
    match: string,
    count: number,
    type?: RedisDataType,
  ): Promise<void> {
    await Promise.all(
      nodes.map(async (node) => {
        // ignore full scanned nodes or nodes with no items
        if ((node.cursor === 0 && node.scanned !== 0) || node.total === 0) {
          return;
        }

        const commandArgs = [`${node.cursor}`, 'MATCH', match, 'COUNT', count];
        if (type) {
          commandArgs.push('TYPE', type);
        }

        const {
          result,
        } = await this.redisManager.execCommandFromNode(
          clientOptions,
          BrowserToolKeysCommands.Scan,
          commandArgs,
          { host: node.host, port: node.port },
          null,
        );

        // eslint-disable-next-line no-param-reassign
        node.cursor = parseInt(result[0], 10);
        node.keys.push(...result[1]);
        // eslint-disable-next-line no-param-reassign
        node.scanned += count;
      }),
    );
  }
}
