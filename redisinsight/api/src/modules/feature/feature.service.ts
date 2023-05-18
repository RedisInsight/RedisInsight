import { find } from 'lodash';
import { Injectable, Logger } from '@nestjs/common';
import { FeatureRepository } from 'src/modules/feature/repositories/feature.repository';
import { FeatureServerEvents, FeatureStorage, knownFeatures } from 'src/modules/feature/constants';
import { FeaturesConfigRepository } from 'src/modules/feature/repositories/features-config.repository';
import { FeatureFlagProvider } from 'src/modules/feature/providers/feature-flag/feature-flag.provider';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class FeatureService {
  private logger = new Logger('FeaturesConfigService');

  constructor(
    private repository: FeatureRepository,
    private featuresConfigRepository: FeaturesConfigRepository,
    private featureFlagProvider: FeatureFlagProvider,
    private eventEmitter: EventEmitter2,
  ) {}

  // todo: disable recommendations
  /**
   *
   */
  async list() {
    this.logger.log('Getting features list');

    const features = {};

    const featuresFromDatabase = await this.repository.list();

    knownFeatures.forEach((feature) => {
      // todo: implement various storage strategies support with next features
      if (feature.storage === FeatureStorage.Database) {
        const dbFeature = find(featuresFromDatabase, { name: feature.name });
        if (dbFeature) {
          features[feature.name] = { flag: dbFeature.flag };
        }
      }
    });

    return { features };
  }

  // todo: add api doc + models
  /**
   * Recalculate flags for database features based on controlGroup and new conditions
   */
  @OnEvent(FeatureServerEvents.FeaturesRecalculate)
  async recalculateFeatureFlags() {
    this.logger.log('Recalculating features flags');

    try {
      const actions = {
        toUpsert: [],
        toDelete: [],
      };

      const featuresFromDatabase = await this.repository.list();
      const featuresConfig = await this.featuresConfigRepository.getOrCreate();

      this.logger.debug('Recalculating features flags for new config', featuresConfig);

      await Promise.all(Array.from(featuresConfig?.data?.features || new Map(), async ([name, feature]) => {
        actions.toUpsert.push({
          name,
          flag: await this.featureFlagProvider.calculate(name, feature),
        });
      }));

      // calculate to delete features
      actions.toDelete = featuresFromDatabase.filter((feature) => !featuresConfig?.data?.features?.[feature.name]);

      // delete features
      await Promise.all(actions.toDelete.map(this.repository.delete.bind(this)));
      // upsert modified features
      await Promise.all(actions.toUpsert.map(this.repository.upsert.bind(this)));

      this.logger.log(
        `Features flags recalculated. Updated: ${actions.toUpsert.length} deleted: ${actions.toDelete.length}`,
      );

      this.eventEmitter.emit(FeatureServerEvents.FeaturesRecalculated, await this.list());
    } catch (e) {
      this.logger.error('Unable to recalculate features flags', e);
    }
  }
}
