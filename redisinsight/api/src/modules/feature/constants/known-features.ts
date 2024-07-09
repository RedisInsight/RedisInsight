import { FeatureStorage, IFeatureFlag, KnownFeatures } from 'src/modules/feature/constants/index';
import { CloudSsoFeatureFlag } from 'src/modules/cloud/cloud-sso.feature.flag';

export const knownFeatures: Record<KnownFeatures, IFeatureFlag> = {
  [KnownFeatures.InsightsRecommendations]: {
    name: KnownFeatures.InsightsRecommendations,
    storage: FeatureStorage.Database,
  },
  [KnownFeatures.CloudSso]: {
    name: KnownFeatures.CloudSso,
    storage: FeatureStorage.Database,
    factory: CloudSsoFeatureFlag.getFeature,
  },
  [KnownFeatures.CloudSsoRecommendedSettings]: {
    name: KnownFeatures.CloudSsoRecommendedSettings,
    storage: FeatureStorage.Database,
  },
  [KnownFeatures.RedisModuleFilter]: {
    name: KnownFeatures.RedisModuleFilter,
    storage: FeatureStorage.Database,
  },
  [KnownFeatures.RedisClient]: {
    name: KnownFeatures.RedisClient,
    storage: FeatureStorage.Database,
  },
  [KnownFeatures.isDesktop]: {
    name: KnownFeatures.isDesktop,
    storage: FeatureStorage.Database,
  },
  [KnownFeatures.DocumentationChat]: {
    name: KnownFeatures.DocumentationChat,
    storage: FeatureStorage.Database,
  },
  [KnownFeatures.DatabaseChat]: {
    name: KnownFeatures.DatabaseChat,
    storage: FeatureStorage.Database,
  },
};
