import { FeatureFlagStrategy } from 'src/modules/feature/providers/feature-flag/strategies/feature.flag.strategy';

export class DefaultFlagStrategy extends FeatureFlagStrategy {
  async calculate(): Promise<boolean> {
    return false;
  }
}
