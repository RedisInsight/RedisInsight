import { v4 as uuidv4 } from 'uuid';
import { Injectable } from '@nestjs/common';
import { getAvailableEndpoints } from 'src/modules/autodiscovery/utils/autodiscovery.util';
import { convertRedisInfoReplyToObject } from 'src/utils';
import config, { Config } from 'src/utils/config';
import { SettingsService } from 'src/modules/settings/settings.service';
import { Database } from 'src/modules/database/models/database';
import { DatabaseService } from 'src/modules/database/database.service';
import { ClientContext, ClientMetadata, SessionMetadata } from 'src/common/models';
import { RedisClientFactory } from 'src/modules/redis/redis.client.factory';
import { plainToClass } from 'class-transformer';
import { ConstantsProvider } from 'src/modules/constants/providers/constants.provider';
import { LoggerService } from 'src/modules/logger/logger.service';

const SERVER_CONFIG = config.get('server') as Config['server'];

@Injectable()
export class AutodiscoveryService {
  constructor(
    private logger: LoggerService,
    private settingsService: SettingsService,
    private redisClientFactory: RedisClientFactory,
    private databaseService: DatabaseService,
    private readonly constantsProvider: ConstantsProvider,
  ) {}

  /**
   * Run auto discovery on first launch only
   */
  async init() {
    try {
      // no need to auto discover for Redis Stack
      if (SERVER_CONFIG.buildType === 'REDIS_STACK') {
        return;
      }

      const sessionMetadata = this.constantsProvider.getSystemSessionMetadata();

      // check agreements to understand if it is first launch
      // todo: [USER_CONTEXT] rethink implementation since it is not possible to know user data at this point
      const settings = await this.settingsService.getAppSettings(
        sessionMetadata,
      );
      if (settings.agreements) {
        return;
      }

      // additional check for existing databases
      // We should not start auto discover if any database already exists
      // TODO: [USER_CONTEXT] rethink implementation since it is not possible to know user data at this point
      if ((await this.databaseService.list(sessionMetadata)).length) {
        return;
      }

      await this.discoverDatabases(sessionMetadata);
    } catch (e) {
      this.logger.warn('Unable to discover redis database', e);
    }
  }

  /**
   * Try to add standalone databases without auth from processes running on the host machine listening on TCP4
   * Database alias will be "host:port"
   * @private
   */
  private async discoverDatabases(sessionMetadata: SessionMetadata) {
    const endpoints = await getAvailableEndpoints();

    // Add redis databases or resolve after 1s to not block app startup for a long time
    await Promise.race([
      Promise.all(endpoints.map((endpoint) => this.addRedisDatabase(sessionMetadata, endpoint))),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]);
  }

  /**
   * Add standalone database without credentials using host and port only
   * @param sessionMetadata
   * @param endpoint
   * @private
   */
  private async addRedisDatabase(sessionMetadata: SessionMetadata, endpoint: { host: string, port: number }) {
    try {
      const client = await this.redisClientFactory.createClient(
        {
          databaseId: uuidv4(),
          context: ClientContext.Common,
          sessionMetadata,
        } as ClientMetadata,
        plainToClass(Database, endpoint),
        { useRetry: false, connectionName: 'redisinsight-auto-discovery' },
      );

      const info = convertRedisInfoReplyToObject(
        await client.sendCommand(
          ['info'],
          { replyEncoding: 'utf8' },
        ) as string,
      );

      if (info?.server?.redis_mode === 'standalone') {
        await this.databaseService.create(
          sessionMetadata,
          {
            name: `${endpoint.host}:${endpoint.port}`,
            ...endpoint,
          } as Database,
        );
      }
    } catch (e) {
      // ignore error
    }
  }
}
