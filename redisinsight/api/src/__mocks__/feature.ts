import { FeaturesConfigEntity } from 'src/modules/feature/entities/features-config.entity';
import {
  FeatureConfig,
  FeatureConfigFilter,
  FeaturesConfig,
  FeaturesConfigData,
} from 'src/modules/feature/model/features-config';
import { classToClass } from 'src/utils';

export const mockFeaturesConfigId = '1';
export const mockFeaturesConfigVersion = 1.111;
export const mockControlNumber = 7.68;

export const mockFeaturesConfigJson = {
  version: mockFeaturesConfigVersion,
  features: {
    liveRecommendations: {
      perc: [[0, 10]],
      flag: true,
      filters: [
        {
          name: 'agreements.analytics',
          value: true,
          cond: 'eq',
        },
      ],
    },
  },
};

export const mockFeaturesConfigData = Object.assign(new FeaturesConfigData(), {
  ...mockFeaturesConfigJson,
  features: new Map(Object.entries({
    liveRecommendations: Object.assign(new FeatureConfig(), {
      ...mockFeaturesConfigJson.features.liveRecommendations,
      filters: [
        Object.assign(new FeatureConfigFilter(), { ...mockFeaturesConfigJson.features.liveRecommendations.filters[0] }),
      ],
    }),
  })),
});

export const mockFeaturesConfig = Object.assign(new FeaturesConfig(), {
  controlNumber: mockControlNumber,
  data: mockFeaturesConfigData,
});

export const mockFeaturesConfigEntity = Object.assign(new FeaturesConfigEntity(), {
  ...classToClass(FeaturesConfigEntity, mockFeaturesConfig),
  id: mockFeaturesConfigId,
});

export const mockFeaturesConfigRepository = jest.fn(() => ({
  getOrCreate: jest.fn().mockResolvedValue(mockFeaturesConfig),
  update: jest.fn().mockResolvedValue(mockFeaturesConfig),
}));

export const mockFeaturesConfigService = () => ({
  sync: jest.fn(),
});
