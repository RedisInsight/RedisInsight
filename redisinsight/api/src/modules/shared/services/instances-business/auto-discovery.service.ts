import {
  Injectable, Logger, OnModuleInit,
} from '@nestjs/common';
import { DatabasesProvider } from 'src/modules/shared/services/instances-business/databases.provider';
import { RedisService } from 'src/modules/core/services/redis/redis.service';
import { AppTool } from 'src/models';
import { getAvailableEndpoints, getRunningProcesses, getTCPEndpoints } from 'src/utils/auto-discovery-helper';
import { convertRedisInfoReplyToObject } from 'src/utils';
import config from 'src/utils/config';
import { SettingsService } from 'src/modules/settings/settings.service';
import { Database } from 'src/modules/database/models/database';
import { DatabaseService } from 'src/modules/database/database.service';

const SERVER_CONFIG = config.get('server');

@Injectable()
export class AutoDiscoveryService implements OnModuleInit {
  private logger = new Logger('AutoDiscoveryService');

  constructor(
    private settingsService: SettingsService,
    private databaseProvider: DatabasesProvider,
    private redisService: RedisService,
    private databaseService: DatabaseService,
  ) {}

  /**
   * Run auto discovery on first launch only
   */
  async onModuleInit() {
    try {
      // no need to auto discover for Redis Stack
      if (SERVER_CONFIG.buildType === 'REDIS_STACK') {
        return;
      }

      // additional check for existing databases
      // We should not start auto discover if any database already exists
      if ((await this.databaseProvider.getAll()).length) {
        return;
      }

      // todo: rethink autodiscovery to not rely on users settings
      const settings = await this.settingsService.getAppSettings('1');
      // check agreements to understand if it is first launch
      if (!settings.agreements) {
        await this.discoverDatabases();
      }
    } catch (e) {
      this.logger.warn('Unable to discover redis database', e);
    }
  }

  /**
   * Try to add standalone databases without auth from processes running on the host machine listening on TCP4
   * Database alias will be "host:port"
   * @private
   */
  private async discoverDatabases() {
    const endpoints = await getAvailableEndpoints(getTCPEndpoints(await getRunningProcesses()));

    // Add redis databases or resolve after 1s to not block app startup for a long time
    await Promise.race([
      Promise.all(endpoints.map(this.addRedisDatabase.bind(this))),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]);
  }

  /**
   * Add standalone database without credentials using host and port only
   * @param endpoint
   * @private
   */
  private async addRedisDatabase(endpoint: { host: string, port: number }) {
    try {
      const client = await this.redisService.createStandaloneClient(
        endpoint as Database,
        AppTool.Common,
        false,
        'redisinsight-auto-discovery',
      );

      const info = convertRedisInfoReplyToObject(
        await client.info(),
      );

      if (info?.server?.redis_mode === 'standalone') {
        await this.databaseService.create({
          name: `${endpoint.host}:${endpoint.port}`,
          ...endpoint,
        } as Database);
      }
    } catch (e) {
      // ignore error
    }
  }
}
