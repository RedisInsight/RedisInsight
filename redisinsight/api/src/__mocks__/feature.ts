import { FeaturesConfigEntity } from 'src/modules/feature/entities/features-config.entity';
import {
  FeatureConfig,
  FeatureConfigFilter, FeatureConfigFilterAnd, FeatureConfigFilterOr,
  FeaturesConfig,
  FeaturesConfigData,
} from 'src/modules/feature/model/features-config';
import { classToClass } from 'src/utils';
import { Feature } from 'src/modules/feature/model/feature';
import { FeatureEntity } from 'src/modules/feature/entities/feature.entity';
import { mockAppSettings } from 'src/__mocks__/app-settings';
import config from 'src/utils/config';
import * as defaultConfig from '../../config/features-config.json';

export const mockFeaturesConfigId = '1';
export const mockFeaturesConfigVersion = defaultConfig.version + 0.111;
export const mockControlNumber = 7.68;
export const mockControlGroup = '7';

export const mockFeaturesConfigJson = {
  version: mockFeaturesConfigVersion,
  features: {
    liveRecommendations: {
      perc: [[1.25, 8.45]],
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

export const mockFeaturesConfigJsonComplex = {
  ...mockFeaturesConfigJson,
  features: {
    liveRecommendations: {
      ...mockFeaturesConfigJson.features.liveRecommendations,
      filters: [
        {
          or: [
            {
              name: 'env.FORCE_ENABLE_LIVE_RECOMMENDATIONS',
              value: 'true',
              type: 'eq',
            },
            {
              and: [
                {
                  name: 'agreements.analytics',
                  value: true,
                  cond: 'eq',
                },
                {
                  or: [
                    {
                      name: 'settings.scanThreshold',
                      value: mockAppSettings.scanThreshold,
                      cond: 'eq',
                    },
                    {
                      name: 'settings.batchSize',
                      value: mockAppSettings.batchSize,
                      cond: 'eq',
                    },
                  ],
                },
              ],
            },
          ],
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

export const mockFeaturesConfigDataComplex = Object.assign(new FeaturesConfigData(), {
  ...mockFeaturesConfigJson,
  features: new Map(Object.entries({
    liveRecommendations: Object.assign(new FeatureConfig(), {
      ...mockFeaturesConfigJson.features.liveRecommendations,
      filters: [
        Object.assign(new FeatureConfigFilterOr(), {
          or: [
            Object.assign(new FeatureConfigFilter(), {
              name: 'env.FORCE_ENABLE_LIVE_RECOMMENDATIONS',
              value: 'true',
              type: 'eq',
            }),
            Object.assign(new FeatureConfigFilterAnd(), {
              and: [
                Object.assign(new FeatureConfigFilter(), {
                  name: 'agreements.analytics',
                  value: true,
                  cond: 'eq',
                }),
                Object.assign(new FeatureConfigFilterOr(), {
                  or: [
                    Object.assign(new FeatureConfigFilter(), {
                      name: 'settings.scanThreshold',
                      value: mockAppSettings.scanThreshold,
                      cond: 'eq',
                    }),
                    Object.assign(new FeatureConfigFilter(), {
                      name: 'settings.batchSize',
                      value: mockAppSettings.batchSize,
                      cond: 'eq',
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  })),
});

export const mockFeaturesConfig = Object.assign(new FeaturesConfig(), {
  controlNumber: mockControlNumber,
  data: mockFeaturesConfigData,
});

export const mockFeaturesConfigComplex = Object.assign(new FeaturesConfig(), {
  controlNumber: mockControlNumber,
  data: mockFeaturesConfigDataComplex,
});

export const mockFeaturesConfigEntity = Object.assign(new FeaturesConfigEntity(), {
  ...classToClass(FeaturesConfigEntity, mockFeaturesConfig),
  id: mockFeaturesConfigId,
});

export const mockFeaturesConfigEntityComplex = Object.assign(new FeaturesConfigEntity(), {
  ...classToClass(FeaturesConfigEntity, mockFeaturesConfigComplex),
  id: mockFeaturesConfigId,
});

export const mockFeature = Object.assign(new Feature(), {
  name: 'liveRecommendations',
  flag: true,
});

export const mockFeatureEntity = Object.assign(new FeatureEntity(), {
  id: 'lr-1',
  name: 'liveRecommendations',
  flag: true,
});

export const mockServerState = {
  settings: mockAppSettings,
  agreements: mockAppSettings.agreements,
  config: config.get(),
  env: process.env,
};

export const mockFeaturesConfigRepository = jest.fn(() => ({
  getOrCreate: jest.fn().mockResolvedValue(mockFeaturesConfig),
  update: jest.fn().mockResolvedValue(mockFeaturesConfig),
}));

export const mockFeaturesConfigService = () => ({
  sync: jest.fn(),
  getControlInfo: jest.fn().mockResolvedValue({
    controlNumber: mockControlNumber,
    controlGroup: mockControlGroup,
  }),
});
