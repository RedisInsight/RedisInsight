import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import config, { Config } from 'src/utils/config';
import { SessionMetadata } from 'src/common/models';
import { PreSetupDatabaseDiscoveryService } from 'src/modules/database-discovery/pre-setup.database-discovery.service';
import { AutoDatabaseDiscoveryService } from 'src/modules/database-discovery/auto.database-discovery.service';
import { DatabaseDiscoveryService } from 'src/modules/database-discovery/database-discovery.service';
import { SettingsService } from 'src/modules/settings/settings.service';

const SERVER_CONFIG = config.get('server') as Config['server'];

@Injectable()
export class LocalDatabaseDiscoveryService extends DatabaseDiscoveryService {
  private logger = new Logger('LocalDatabaseDiscoveryService');
  private isDiscoveryRunning = false;

  constructor(
    @Inject(forwardRef(() => SettingsService))
    private readonly settingsService: SettingsService,
    private readonly autoDatabaseDiscoveryService: AutoDatabaseDiscoveryService,
    private readonly preSetupDatabaseDiscoveryService: PreSetupDatabaseDiscoveryService,
  ) {
    super();
  }

  /**
   * Non-blocking implementation of database discovery
   * This returns quickly and performs the actual discovery work in the background
   */
  async discover(
    sessionMetadata: SessionMetadata,
    firstRun?: boolean,
  ): Promise<void> {
    // Return immediately if discovery is already in progress
    if (this.isDiscoveryRunning) {
      return;
    }

    // No need to auto discover for Redis Stack - quick check
    if (SERVER_CONFIG.buildType === 'REDIS_STACK') {
      return;
    }

    // Mark as running and perform discovery in background
    this.isDiscoveryRunning = true;
    try {
      // check agreements to understand if it is first launch
      const settings =
        await this.settingsService.getAppSettings(sessionMetadata);

      if (!settings?.agreements?.eula) {
        this.isDiscoveryRunning = false;
        return;
      }

      const { discovered } =
        await this.preSetupDatabaseDiscoveryService.discover(sessionMetadata);

      if (!discovered && firstRun) {
        await this.autoDatabaseDiscoveryService.discover(sessionMetadata);
      }
    } catch (e) {
      // ignore error
      this.logger.error('Unable to discover databases', e);
    } finally {
      this.isDiscoveryRunning = false;
    }
  }
}
