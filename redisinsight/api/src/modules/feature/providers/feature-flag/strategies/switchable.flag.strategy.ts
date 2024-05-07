import { FeatureFlagStrategy } from 'src/modules/feature/providers/feature-flag/strategies/feature.flag.strategy';
import { Feature } from 'src/modules/feature/model/feature';
import { IFeatureFlag } from 'src/modules/feature/constants';

export class SwitchableFlagStrategy extends FeatureFlagStrategy {
  async calculate(knownFeature: IFeatureFlag, featureConfig: any): Promise<Feature> {
    const isInRange = await this.isInTargetRange(featureConfig?.perc);
    const isInFilter = await this.filter(featureConfig?.filters) ? !!featureConfig.flag : !featureConfig?.flag;
    const force = (await FeatureFlagStrategy.getCustomConfig())?.[knownFeature.name];

    let flag = isInRange && isInFilter;

    if (isInFilter && force === true) {
      flag = true;
    } else if (isInFilter && force === false) {
      flag = false;
    }

    return {
      name: knownFeature.name,
      flag,
      data: featureConfig?.data,
    };
  }
}
