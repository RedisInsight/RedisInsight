import { FeatureFlagStrategy } from 'src/modules/feature/providers/feature-flag/strategies/feature.flag.strategy';
import { Feature } from 'src/modules/feature/model/feature';
import { IFeatureFlag } from 'src/modules/feature/constants';

export class WithDataFlagStrategy extends FeatureFlagStrategy {
  async calculate(knownFeature: IFeatureFlag, featureConfig: any): Promise<Feature> {
    const isInRange = await this.isInTargetRange(featureConfig?.perc);

    return {
      name: knownFeature.name,
      flag: isInRange && await this.filter(featureConfig?.filters) ? !!featureConfig?.flag : !featureConfig?.flag,
      data: featureConfig?.data,
    };
  }
}
