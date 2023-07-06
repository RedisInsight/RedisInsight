import { FeatureStorage, IFeatureFlag, KnownFeatures } from 'src/modules/feature/constants/index';
import { CloudSsoFeatureFlag } from 'src/modules/cloud/cloud-sso.feature.flag';

export const knownFeatures: IFeatureFlag[] = [
  {
    name: KnownFeatures.InsightsRecommendations,
    storage: FeatureStorage.Database,
  },
  {
    name: KnownFeatures.CloudSso,
    storage: FeatureStorage.Custom,
    factory: CloudSsoFeatureFlag.getFeature,
  },
];
