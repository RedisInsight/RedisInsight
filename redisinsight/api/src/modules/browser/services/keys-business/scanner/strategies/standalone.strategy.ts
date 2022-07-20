import * as isGlob from 'is-glob';
import { isNull } from 'lodash';
import config from 'src/utils/config';
import { unescapeGlob } from 'src/utils';
import {
  GetKeyInfoResponse,
  GetKeysWithDetailsResponse,
  RedisDataType,
} from 'src/modules/browser/dto';
import { BrowserToolService } from 'src/modules/browser/services/browser-tool/browser-tool.service';
import { BrowserToolKeysCommands } from 'src/modules/browser/constants/browser-tool-commands';
import { ISettingsProvider } from 'src/modules/core/models/settings-provider.interface';
import { AbstractStrategy } from './abstract.strategy';
import { IGetNodeKeysResult } from '../scanner.interface';

const REDIS_SCAN_CONFIG = config.get('redis_scan');

export class StandaloneStrategy extends AbstractStrategy {
  private readonly redisManager: BrowserToolService;

  private settingsProvider: ISettingsProvider;

  constructor(
    redisManager: BrowserToolService,
    settingsProvider: ISettingsProvider,
  ) {
    super(redisManager);
    this.redisManager = redisManager;
    this.settingsProvider = settingsProvider;
  }

  public async getKeys(
    clientOptions,
    args,
  ): Promise<GetKeysWithDetailsResponse[]> {
    const match = args.match !== undefined ? args.match : '*';
    const count = args.count || REDIS_SCAN_CONFIG.countDefault;
    const client = await this.redisManager.getRedisClient(clientOptions);

    const node = {
      total: 0,
      scanned: 0,
      keys: [],
      cursor: parseInt(args.cursor, 10),
    };

    try {
      node.total = await this.redisManager.execCommand(
        clientOptions,
        BrowserToolKeysCommands.DbSize,
        [],
      );
    } catch (e) {
      node.total = null;
    }

    if (!isGlob(match, { strict: false })) {
      const keyName = unescapeGlob(match);
      node.cursor = 0;     
      node.scanned = isNull(node.total) ? 1 : node.total;
      node.keys = await this.getKeysInfo(client, [keyName]);
      node.keys = node.keys.filter((key: GetKeyInfoResponse) => {
        if (key.ttl === -2) {
          return false;
        }
        if (args.type) {
          return key.type === args.type;
        }
        return true;
      });
      return [node];
    }

    await this.scan(clientOptions, node, match, count, args.type);

    if (node.keys.length) {
      node.keys = await this.getKeysInfo(client, node.keys, args.type);
    }

    return [node];
  }

  public async scan(
    clientOptions,
    node: IGetNodeKeysResult,
    match: string,
    count: number,
    type?: RedisDataType,
  ): Promise<void> {
    let fullScanned = false;
    const settings = await this.settingsProvider.getSettings();
    while (
      (node.total > 0 || isNull(node.total))
      && !fullScanned
      && node.keys.length < count
      && (
        (node.total < settings.scanThreshold && node.cursor)
        || node.scanned < settings.scanThreshold
      )
    ) {
      let commandArgs = [`${node.cursor}`, 'MATCH', match, 'COUNT', count];
      if (type) {
        commandArgs = [...commandArgs, 'TYPE', type];
      }
      const execResult = await this.redisManager.execCommand(
        clientOptions,
        BrowserToolKeysCommands.Scan,
        [...commandArgs],
        null,
      );

      const [nextCursor, keys] = execResult;
      // eslint-disable-next-line no-param-reassign
      node.cursor = parseInt(nextCursor, 10);
      // eslint-disable-next-line no-param-reassign
      node.scanned += count;
      node.keys.push(...keys);
      fullScanned = node.cursor === 0;
    }
  }
}
