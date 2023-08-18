import { FeatureFlagStrategy } from 'src/modules/feature/providers/feature-flag/strategies/feature.flag.strategy';
import { Feature } from 'src/modules/feature/model/feature';
import { IFeatureFlag } from 'src/modules/feature/constants';

export class CloudSsoFlagStrategy extends FeatureFlagStrategy {
  async calculate(knownFeature: IFeatureFlag, featureConfig: any): Promise<Feature> {
    const isInRange = await this.isInTargetRange(featureConfig?.perc);

    const feature = {
      name: knownFeature.name,
      flag: false,
      data: featureConfig?.data,
    };

    const isEnabledByConfig = isInRange
    && await this.filter(featureConfig?.filters) ? !!featureConfig?.flag : !featureConfig?.flag;

    if (isEnabledByConfig && knownFeature.factory) {
      return {
        ...feature,
        ...(await knownFeature.factory()),
      };
    }

    return feature;
  }
}
