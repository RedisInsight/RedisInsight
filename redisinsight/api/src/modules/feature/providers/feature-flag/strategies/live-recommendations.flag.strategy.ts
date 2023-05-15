import { FeatureFlagStrategy } from 'src/modules/feature/providers/feature-flag/strategies/feature.flag.strategy';

export class LiveRecommendationsFlagStrategy extends FeatureFlagStrategy {
  async calculate(featureConfig: any): Promise<boolean> {
    const isInRange = await this.isInTargetRange(featureConfig?.perc);

    return isInRange && await this.isInFilter(featureConfig?.filters) ? !!featureConfig?.flag : !featureConfig?.flag;
  }
}
