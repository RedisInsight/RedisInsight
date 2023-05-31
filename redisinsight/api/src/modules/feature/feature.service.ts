import { find } from 'lodash';
import { Injectable, Logger } from '@nestjs/common';
import { FeatureRepository } from 'src/modules/feature/repositories/feature.repository';
import { FeatureServerEvents, FeatureStorage, knownFeatures } from 'src/modules/feature/constants';
import { FeaturesConfigRepository } from 'src/modules/feature/repositories/features-config.repository';
import { FeatureFlagProvider } from 'src/modules/feature/providers/feature-flag/feature-flag.provider';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { FeatureAnalytics } from 'src/modules/feature/feature.analytics';

@Injectable()
export class FeatureService {
  private logger = new Logger('FeaturesConfigService');

  constructor(
    private readonly repository: FeatureRepository,
    private readonly featuresConfigRepository: FeaturesConfigRepository,
    private readonly featureFlagProvider: FeatureFlagProvider,
    private readonly eventEmitter: EventEmitter2,
    private readonly analytics: FeatureAnalytics,
  ) {}

  /**
   * Check if feature enabled
   * @param name
   */
  async isFeatureEnabled(name: string): Promise<boolean> {
    try {
      // todo: add non-database features if needed
      const model = await this.repository.get(name);

      return model?.flag === true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Returns list of features flags
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

    try {
      this.analytics.sendFeatureFlagRecalculated({
        configVersion: (await this.featuresConfigRepository.getOrCreate())?.data?.version,
        features,
      });
    } catch (e) {
      // ignore telemetry error
    }
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
      actions.toDelete = featuresFromDatabase.filter((feature) => !featuresConfig?.data?.features?.has?.(feature.name));

      // delete features
      await Promise.all(actions.toDelete.map((feature) => this.repository.delete(feature)));
      // upsert modified features
      await Promise.all(actions.toUpsert.map((feature) => this.repository.upsert(feature)));

      this.logger.log(
        `Features flags recalculated. Updated: ${actions.toUpsert.length} deleted: ${actions.toDelete.length}`,
      );

      this.eventEmitter.emit(FeatureServerEvents.FeaturesRecalculated, await this.list());
    } catch (e) {
      this.logger.error('Unable to recalculate features flags', e);
    }
  }
}
