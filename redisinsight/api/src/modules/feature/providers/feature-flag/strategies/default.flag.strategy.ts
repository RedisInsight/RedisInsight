import { FeatureFlagStrategy } from 'src/modules/feature/providers/feature-flag/strategies/feature.flag.strategy';
import { Feature } from 'src/modules/feature/model/feature';
import { IFeatureFlag } from 'src/modules/feature/constants';

export class DefaultFlagStrategy extends FeatureFlagStrategy {
  async calculate(knownFeature: IFeatureFlag): Promise<Feature> {
    return {
      name: knownFeature.name,
      flag: false,
    };
  }
}
