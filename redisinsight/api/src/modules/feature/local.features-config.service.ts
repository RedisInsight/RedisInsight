import axios from 'axios';
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import config from 'src/utils/config';
import { FeaturesConfigRepository } from 'src/modules/feature/repositories/features-config.repository';
import {
  FeatureConfigConfigDestination,
  FeatureServerEvents,
} from 'src/modules/feature/constants';
import { Validator } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { FeaturesConfigData } from 'src/modules/feature/model/features-config';
import { FeatureAnalytics } from 'src/modules/feature/feature.analytics';
import { UnableToFetchRemoteConfigException } from 'src/modules/feature/exceptions';
import { FeaturesConfigService } from 'src/modules/feature/features-config.service';
import { ConstantsProvider } from 'src/modules/constants/providers/constants.provider';
import { SessionMetadata } from 'src/common/models';
import * as defaultConfig from '../../../config/features-config.json';

const FEATURES_CONFIG = config.get('features_config');

@Injectable()
export class LocalFeaturesConfigService
  extends FeaturesConfigService
  implements OnApplicationBootstrap {
  private logger = new Logger('LocalFeaturesConfigService');

  private validator = new Validator();

  constructor(
    private readonly repository: FeaturesConfigRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly analytics: FeatureAnalytics,
    private readonly constantsProvider: ConstantsProvider,
  ) {
    super();
  }

  /**
   * Sync config on startup
   * Set interval to re-sync automatically without waiting for next app start
   */
  async onApplicationBootstrap() {
    // todo: [USER_CONTEXT] revise
    const sessionMetadata = this.constantsProvider.getSystemSessionMetadata();
    this.sync(sessionMetadata).catch();
    if (FEATURES_CONFIG.syncInterval > 0) {
      setInterval(this.sync.bind(this, sessionMetadata), FEATURES_CONFIG.syncInterval);
    }
  }

  /**
   * Fetch remote new config from remote server
   * @private
   */
  private async fetchRemoteConfig(): Promise<any> {
    try {
      this.logger.log('Fetching remote config...');

      const { data } = await axios.get(FEATURES_CONFIG.url);

      return data;
    } catch (error) {
      this.logger.error('Unable to fetch remote config', error);
      throw new UnableToFetchRemoteConfigException();
    }
  }

  private async getNewConfig(): Promise<{
    data: any;
    type: FeatureConfigConfigDestination;
  }> {
    let remoteConfig: any;
    let newConfig: any = {
      data: defaultConfig,
      type: FeatureConfigConfigDestination.Default,
    };

    try {
      this.logger.log('Fetching remote config...');

      remoteConfig = await this.fetchRemoteConfig();

      // we should use default config in case when remote is invalid
      await this.validator.validateOrReject(
        plainToClass(FeaturesConfigData, remoteConfig),
      );

      if (remoteConfig?.version > defaultConfig?.version) {
        newConfig = {
          data: remoteConfig,
          type: FeatureConfigConfigDestination.Remote,
        };
      }
    } catch (error) {
      this.analytics.sendFeatureFlagInvalidRemoteConfig({
        configVersion: remoteConfig?.version,
        error,
      });

      this.logger.error('Something wrong with remote config', error);
    }

    return newConfig;
  }

  /**
   * @inheritDoc
   */
  public async sync(sessionMetadata: SessionMetadata): Promise<void> {
    let newConfig;

    try {
      this.logger.log('Trying to sync features config...');

      const currentConfig = await this.repository.getOrCreate(sessionMetadata);
      newConfig = await this.getNewConfig();

      if (newConfig?.data?.version > currentConfig?.data?.version) {
        await this.repository.update(sessionMetadata, newConfig.data);
        this.analytics.sendFeatureFlagConfigUpdated({
          oldVersion: currentConfig?.data?.version,
          configVersion: newConfig.data.version,
          type: newConfig.type,
        });
      }

      this.logger.log('Successfully updated stored remote config');
      this.eventEmitter.emit(FeatureServerEvents.FeaturesRecalculate);
    } catch (error) {
      this.analytics.sendFeatureFlagConfigUpdateError({
        configVersion: newConfig?.version,
        error,
      });

      this.logger.error('Unable to update features config', error);
    }
  }

  /**
   * @inheritDoc
   */
  public async getControlInfo(sessionMetadata: SessionMetadata): Promise<{
    controlNumber: number;
    controlGroup: string;
  }> {
    this.logger.debug('Trying to get controlGroup field');

    const model = await this.repository.getOrCreate(sessionMetadata);

    return {
      controlNumber: model.controlNumber,
      controlGroup: parseInt(model.controlNumber.toString(), 10).toFixed(0),
    };
  }
}
