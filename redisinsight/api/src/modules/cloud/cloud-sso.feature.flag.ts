import { BuildType } from 'src/modules/server/models/server';
import config, { Config } from 'src/utils/config';
import { Feature } from 'src/modules/feature/model/feature';
import { KnownFeatures } from 'src/modules/feature/constants';

const serverConfig = config.get('server') as Config['server'];

export enum CloudSsoFeatureStrategy {
  DeepLink = 'deepLink',
  Web = 'web',
}

export class CloudSsoFeatureFlag {
  static getFeature(): Feature {
    if (serverConfig.buildType === BuildType.Electron) {
      return {
        name: KnownFeatures.CloudSso,
        flag: true,
        strategy: CloudSsoFeatureStrategy.DeepLink,
      };
    }

    return {
      name: KnownFeatures.CloudSso,
      flag: false,
    };
  }
}
