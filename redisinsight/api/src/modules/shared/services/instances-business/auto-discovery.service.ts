import {
  Inject, Injectable, Logger, OnModuleInit,
} from '@nestjs/common';
import { DatabasesProvider } from 'src/modules/shared/services/instances-business/databases.provider';
import { RedisService } from 'src/modules/core/services/redis/redis.service';
import { AppTool } from 'src/models';
import { InstancesBusinessService } from 'src/modules/shared/services/instances-business/instances-business.service';
import { getAvailableEndpoints, getRunningProcesses, getTCP4Endpoints } from 'src/utils/auto-discovery-helper';
import { convertRedisInfoReplyToObject } from 'src/utils';
import { ISettingsProvider } from 'src/modules/core/models/settings-provider.interface';
import config from 'src/utils/config';

const SERVER_CONFIG = config.get('server');

@Injectable()
export class AutoDiscoveryService implements OnModuleInit {
  private logger = new Logger('AutoDiscoveryService');

  constructor(
    @Inject('SETTINGS_PROVIDER')
    private settingsService: ISettingsProvider,
    private databaseProvider: DatabasesProvider,
    private redisService: RedisService,
    private databaseService: InstancesBusinessService,
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

      const settings = await this.settingsService.getSettings();
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
    const endpoints = await getAvailableEndpoints(getTCP4Endpoints(await getRunningProcesses()));

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
        endpoint,
        AppTool.Common,
        false,
        'redisinsight-auto-discovery',
      );

      const info = convertRedisInfoReplyToObject(
        await client.send_command('info'),
      );

      if (info?.server?.redis_mode === 'standalone') {
        await this.databaseService.addDatabase({
          name: `${endpoint.host}:${endpoint.port}`,
          ...endpoint,
        });
      }
    } catch (e) {
      // ignore error
    }
  }
}
