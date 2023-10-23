import { toNumber, omit, isNull } from 'lodash';
import config from 'src/utils/config';
import { isRedisGlob, unescapeRedisGlob } from 'src/utils';
import {
  BrowserToolClusterService,
} from 'src/modules/browser/services/browser-tool-cluster/browser-tool-cluster.service';
import { ClientMetadata } from 'src/common/models';
import { BrowserToolKeysCommands } from 'src/modules/browser/constants/browser-tool-commands';
import {
  GetKeyInfoResponse,
  GetKeysWithDetailsResponse,
  RedisDataType,
} from 'src/modules/browser/keys/keys.dto';
import { parseClusterCursor } from 'src/modules/browser/utils/clusterCursor';
import { SettingsService } from 'src/modules/settings/settings.service';
import { getTotal } from 'src/modules/database/utils/database.total.util';
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
    const nodes = await this.getNodesToScan(clientOptions, args.cursor);
    // todo: remove settings from here. threshold should be part of query?
    const settings = await this.settingsService.getAppSettings('1');
    await this.calculateNodesTotalKeys(nodes);

    if (!isRedisGlob(match)) {
      const keyName = Buffer.from(unescapeRedisGlob(match));
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
        if (node.keys.length && args.keysInfo) {
          // eslint-disable-next-line no-param-reassign
          node.keys = await this.getKeysInfo(
            node.node,
            node.keys,
            args.type,
          );
        } else {
          // eslint-disable-next-line no-param-reassign
          node.keys = node.keys.map((name) => ({ name, type: args.type || undefined }));
        }
      }),
    );

    return nodes.map((node) => omit(node, 'node'));
  }

  private async getNodesToScan(
    clientMetadata: ClientMetadata,
    initialCursor: string,
  ): Promise<IGetNodeKeysResult[]> {
    const nodesClients = await this.redisManager.getNodes(
      clientMetadata,
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
    nodes: IGetNodeKeysResult[],
  ): Promise<void> {
    await Promise.all(
      nodes.map(async (node) => {
        // eslint-disable-next-line no-param-reassign
        node.total = await getTotal(node?.node);
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
