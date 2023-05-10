import { FeatureFlagStrategy } from 'src/modules/feature/providers/feature-flag/strategies/feature.flag.strategy';

export class LiveRecommendationsFlagStrategy extends FeatureFlagStrategy {
  async calculate(conditions: any): Promise<boolean> {
    const isInRange = await this.isInTargetRange(conditions?.perc);

    // todo: add filters
    return isInRange ? !!conditions?.flag : !conditions?.flag;
  }
}
