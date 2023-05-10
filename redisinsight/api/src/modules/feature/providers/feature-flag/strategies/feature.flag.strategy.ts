import { FeaturesConfigService } from 'src/modules/feature/features-config.service';

export abstract class FeatureFlagStrategy {
  constructor(
    protected readonly featuresConfigService: FeaturesConfigService,
  ) {}

  abstract calculate(data: any): Promise<boolean>;

  protected async isInTargetRange(perc: number[][] = [[-1]]): Promise<boolean> {
    const controlGroup = await this.featuresConfigService.getControlGroup();

    return !!perc.find((range) => controlGroup >= range[0] && controlGroup < range[1]);
  }
}
