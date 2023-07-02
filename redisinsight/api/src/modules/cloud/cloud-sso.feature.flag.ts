import { inRange } from 'lodash';
import { BuildType, PackageType } from 'src/modules/server/models/server';
import config from 'src/utils/config';
import { Feature } from 'src/modules/feature/model/feature';
import { KnownFeatures } from 'src/modules/feature/constants';

const serverConfig = config.get('server');

export enum CloudSsoFeatureStrategy {
  DeepLink = 'deepLink',
  Web = 'web',
}

export class CloudSsoFeatureFlag {
  static getWebEndpoint(defaultUri: string): string {
    const { strategy } = CloudSsoFeatureFlag.getFeature();

    if (strategy === CloudSsoFeatureStrategy.Web) {
      const protocol = serverConfig.tls && serverConfig.tlsCert && serverConfig.tlsKey ? 'https' : 'http';
      const port = parseInt(process.env.API_PORT || serverConfig.port, 10);
      const url = new URL('/api/cloud/oauth/callback', `${protocol}://127.0.0.1:${port}`);
      return url.toString();
    }

    return defaultUri;
  }

  static getFeature(): Feature {
    if (serverConfig.buildType === BuildType.Electron) {
      if (process.env.BUILD_PACKAGE?.toLowerCase?.() === PackageType.AppImage) {
        return {
          name: KnownFeatures.CloudSso,
          flag: inRange(parseInt(process.env.API_PORT || serverConfig.port, 10), 5530, 5540),
          strategy: CloudSsoFeatureStrategy.Web,
        };
      }

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
