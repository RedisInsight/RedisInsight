import { isNull } from 'lodash';
import config from 'src/utils/config';
import { isRedisGlob, unescapeRedisGlob } from 'src/utils';
import {
  GetKeyInfoResponse,
  GetKeysWithDetailsResponse,
  RedisDataType,
} from 'src/modules/browser/dto';
import { BrowserToolService } from 'src/modules/browser/services/browser-tool/browser-tool.service';
import { BrowserToolKeysCommands } from 'src/modules/browser/constants/browser-tool-commands';
import { SettingsService } from 'src/modules/settings/settings.service';
import { getTotal } from 'src/modules/database/utils/database.total.util';
import { AbstractStrategy } from './abstract.strategy';
import { IGetNodeKeysResult } from '../scanner.interface';

const REDIS_SCAN_CONFIG = config.get('redis_scan');

export class StandaloneStrategy extends AbstractStrategy {
  private readonly redisManager: BrowserToolService;

  private settingsService: SettingsService;

  constructor(
    redisManager: BrowserToolService,
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

    const node = {
      total: 0,
      scanned: 0,
      keys: [],
      cursor: parseInt(args.cursor, 10),
    };

    node.total = await getTotal(client);

    if (!isRedisGlob(match)) {
      const keyName = Buffer.from(unescapeRedisGlob(match));
      node.cursor = 0;
      node.scanned = isNull(node.total) ? 1 : node.total;
      node.keys = await this.getKeysInfo(client, [keyName], args.type);
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

    if (node.keys.length && args.keysInfo) {
      node.keys = await this.getKeysInfo(client, node.keys, args.type);
    } else {
      node.keys = node.keys.map((name) => ({ name, type: args.type || undefined }));
    }

    // workaround for "pika" databases
    if (!node.total && (node.cursor > 0 || node.keys?.length)) {
      node.total = null;
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
    const COUNT = Math.min(2000, count);

    let fullScanned = false;
    // todo: remove settings from here. threshold should be part of query?
    const settings = await this.settingsService.getAppSettings('1');
    while (
      (node.total >= 0 || isNull(node.total))
      && !fullScanned
      && node.keys.length < count
      && (
        node.scanned < settings.scanThreshold
      )
    ) {
      let commandArgs = [`${node.cursor}`, 'MATCH', match, 'COUNT', COUNT];
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
      node.scanned += COUNT;
      node.keys.push(...keys);
      fullScanned = node.cursor === 0;
    }
  }
}
