import { get, omit } from 'lodash';
import { FeaturesConfigService } from 'src/modules/feature/features-config.service';
import { SettingsService } from 'src/modules/settings/settings.service';
import { GetAppSettingsResponse } from 'src/modules/settings/dto/settings.dto';
import { FeatureConfigFilterCondition } from 'src/modules/feature/model/features-config';

export abstract class FeatureFlagStrategy {
  constructor(
    protected readonly featuresConfigService: FeaturesConfigService,
    protected readonly settingsService: SettingsService,
  ) {}

  abstract calculate(data: any): Promise<boolean>;

  /**
   * Check if controlNumber is in defined range
   * Should return false in case of any error
   * @param perc
   * @protected
   */
  protected async isInTargetRange(perc: number[][] = [[-1]]): Promise<boolean> {
    try {
      const { controlNumber } = await this.featuresConfigService.getControlInfo();

      return !!perc.find((range) => controlNumber >= range[0] && controlNumber < range[1]);
    } catch (e) {
      return false;
    }
  }

  // todo: remove
  protected async getAppSettings(): Promise<GetAppSettingsResponse> {
    try {
      return this.settingsService.getAppSettings('1');
    } catch (e) {
      return null;
    }
  }

  protected async getServerState(): Promise<object> {
    try {
      const appSettings = await this.getAppSettings();
      return {
        agreements: appSettings?.agreements,
        settings: omit(appSettings, 'agreements'),
      };
    } catch (e) {
      return null;
    }
  }

  protected async isInFilter(filters: any[]): Promise<boolean> {
    try {
      const state = await this.getServerState();

      return !!filters.every((filter) => {
        const value = get(state, filter?.name);

        switch (filter?.cond) {
          case FeatureConfigFilterCondition.Eq: return value === filter?.value;
          case FeatureConfigFilterCondition.Neq: return value !== filter?.value;
          case FeatureConfigFilterCondition.Gt: return value > filter?.value;
          case FeatureConfigFilterCondition.Gte: return value >= filter?.value;
          case FeatureConfigFilterCondition.Lt: return value < filter?.value;
          case FeatureConfigFilterCondition.Lte: return value <= filter?.value;
          default: return false;
        }
      });
    } catch (e) {
      return false;
    }
  }
}
