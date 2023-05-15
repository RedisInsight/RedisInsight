import { FeaturesConfigEntity } from 'src/modules/feature/entities/features-config.entity';
import { FeaturesConfig, FeaturesConfigData } from 'src/modules/feature/model/features-config';
import { plainToClass } from 'class-transformer';
import { classToClass } from 'src/utils';

export const mockFeaturesConfigId = '1';
export const mockControlNumber = 7.68;

export const mockFeaturesConfigJson = {
  version: 1,
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

export const mockFeaturesConfigData = plainToClass(FeaturesConfigData, {
  version: mockFeaturesConfigJson.version,
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
  getOrCreate: jest.fn(),
  update: jest.fn(),
}));

export const mockFeaturesConfigService = () => ({
  sync: jest.fn(),
});
