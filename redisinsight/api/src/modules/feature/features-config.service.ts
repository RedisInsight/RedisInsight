import axios from 'axios';
import {
  Injectable, Logger, NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import config from 'src/utils/config';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { FeaturesConfigRepository } from 'src/modules/feature/repositories/features-config.repository';
import { FeatureServerEvents } from 'src/modules/feature/constants';
import { Validator } from 'class-validator';

const FEATURES_CONFIG = config.get('features_config');

@Injectable()
export class FeaturesConfigService {
  private logger = new Logger('FeaturesConfigService');

  private validator = new Validator();

  constructor(
    private repository: FeaturesConfigRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  async onApplicationBootstrap() {
    await this.sync();
    if (FEATURES_CONFIG.syncInterval > 0) {
      setInterval(this.sync.bind(this), FEATURES_CONFIG.syncInterval);
    }
  }

  private async fetchRemoteConfig() {
    try {
      this.logger.log('Trying to fetch remote features config...');

      const { data } = await axios.get(FEATURES_CONFIG.url, {
        responseType: 'text',
        transformResponse: [(raw) => raw],
      });

      return JSON.parse(data);
    } catch (error) {
      this.logger.error('Unable to fetch remote config', error);
    }

    return null;
  }

  /**
   * Get latest config from remote and save it in the local database
   */
  private async sync() {
    try {
      this.logger.log('Trying to sync features config...');

      const featuresConfig = await this.repository.getOrCreate();
      const newConfig = await this.fetchRemoteConfig();

      await this.validator.validateOrReject(newConfig);

      if (newConfig?.version > featuresConfig?.data?.version) {
        await this.repository.update(newConfig);
      }

      this.logger.log('Successfully updated stored remote config');
    } catch (error) {
      this.logger.error('Unable to update features config', error);
    }

    this.eventEmitter.emit(FeatureServerEvents.FeaturesRecalculate);
  }

  /**
   * Get control group field
   */
  public async getControlInfo(): Promise<{ controlNumber: number, controlGroup: string }> {
    try {
      this.logger.debug('Trying to get controlGroup field');

      const entity = await (this.repository.getOrCreate());
      return {
        controlNumber: entity.controlNumber,
        controlGroup: entity.controlNumber.toFixed(0),
      };
    } catch (error) {
      this.logger.error('Unable to get controlGroup field', error);
      throw new NotFoundException(ERROR_MESSAGES.CONTROL_GROUP_NOT_EXIST);
    }
  }
}
