export enum FeatureServerEvents {
  FeaturesRecalculate = 'FeaturesRecalculate',
  FeaturesRecalculated = 'FeaturesRecalculated',
}

export enum FeatureEvents {
  Features = 'features',
}

export enum FeatureStorage {
  Env = 'env',
  Database = 'database',
}

export enum FeatureRecalculationStrategy {
  LiveRecommendation = 'liveRecommendation',
}

export const knownFeatures = [
  {
    name: 'liveRecommendations',
    storage: FeatureStorage.Database,
  },
];
