import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import {
  mockControlGroup,
  mockControlNumber, mockFeatureAnalytics,
  mockFeaturesConfig,
  mockFeaturesConfigJson,
  mockFeaturesConfigRepository,
  MockType,
} from 'src/__mocks__';
import { FeaturesConfigService } from 'src/modules/feature/features-config.service';
import { FeaturesConfigRepository } from 'src/modules/feature/repositories/features-config.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { plainToClass } from 'class-transformer';
import { FeaturesConfigData } from 'src/modules/feature/model/features-config';
import { FeatureConfigConfigDestination, FeatureServerEvents, KnownFeatures } from 'src/modules/feature/constants';
import { FeatureAnalytics } from 'src/modules/feature/feature.analytics';
import { UnableToFetchRemoteConfigException } from 'src/modules/feature/exceptions';
import * as defaultConfig from '../../../config/features-config.json';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('FeaturesConfigService', () => {
  let service: FeaturesConfigService;
  let repository: MockType<FeaturesConfigRepository>;
  let analytics: MockType<FeatureAnalytics>;
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeaturesConfigService,
        {
          provide: EventEmitter2,
          useFactory: () => ({
            emit: jest.fn(),
          }),
        },
        {
          provide: FeaturesConfigRepository,
          useFactory: mockFeaturesConfigRepository,
        },
        {
          provide: FeatureAnalytics,
          useFactory: mockFeatureAnalytics,
        },
      ],
    }).compile();

    service = module.get(FeaturesConfigService);
    repository = module.get(FeaturesConfigRepository);
    analytics = module.get(FeatureAnalytics);
    eventEmitter = module.get(EventEmitter2);

    mockedAxios.get.mockResolvedValue({ data: mockFeaturesConfigJson });
  });

  describe('onApplicationBootstrap', () => {
    it('should sync on bootstrap', async () => {
      const spy = jest.spyOn(service, 'sync');
      await service['onApplicationBootstrap']();

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('getNewConfig', () => {
    it('should return remote config', async () => {
      const result = await service['getNewConfig']();

      expect(result).toEqual({ data: mockFeaturesConfigJson, type: FeatureConfigConfigDestination.Remote });
      expect(analytics.sendFeatureFlagInvalidRemoteConfig).not.toHaveBeenCalled();
    });
    it('should return default config when unable to fetch remote config', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('404 not found'));

      const result = await service['getNewConfig']();

      expect(result).toEqual({ data: defaultConfig, type: FeatureConfigConfigDestination.Default });
      expect(analytics.sendFeatureFlagInvalidRemoteConfig).toHaveBeenCalledWith({
        configVersion: undefined, // no config version since unable to fetch
        error: new UnableToFetchRemoteConfigException(),
      });
    });
    it('should return default config when invalid remote config fetched', async () => {
      const validateSpy = jest.spyOn(service['validator'], 'validateOrReject');
      const validationError = new Error('ValidationError');
      validateSpy.mockRejectedValueOnce([validationError]);
      mockedAxios.get.mockResolvedValue({
        data: {
          ...mockFeaturesConfigJson,
          features: {
            [KnownFeatures.InsightsRecommendations]: {
              ...mockFeaturesConfigJson.features[KnownFeatures.InsightsRecommendations],
              flag: 'not boolean flag',
            },
          },
        },
      });

      const result = await service['getNewConfig']();

      expect(result).toEqual({ data: defaultConfig, type: FeatureConfigConfigDestination.Default });
      expect(analytics.sendFeatureFlagInvalidRemoteConfig).toHaveBeenCalledWith({
        configVersion: mockFeaturesConfigJson.version, // no config version since unable to fetch
        error: [validationError],
      });
    });
    it('should return default config when remote config version less then default', async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          ...mockFeaturesConfigJson,
          version: defaultConfig.version - 0.1,
        },
      });

      const result = await service['getNewConfig']();

      expect(result).toEqual({ data: defaultConfig, type: FeatureConfigConfigDestination.Default });
      expect(analytics.sendFeatureFlagInvalidRemoteConfig).not.toHaveBeenCalled();
    });
  });

  describe('sync', () => {
    it('should update to the latest remote config', async () => {
      repository.getOrCreate.mockResolvedValue({
        ...mockFeaturesConfig,
        data: plainToClass(FeaturesConfigData, defaultConfig),
      });

      await service['sync']();

      expect(repository.update).toHaveBeenCalledWith(mockFeaturesConfigJson);
      expect(eventEmitter.emit).toHaveBeenCalledWith(FeatureServerEvents.FeaturesRecalculate);
      expect(analytics.sendFeatureFlagConfigUpdated).toHaveBeenCalledWith({
        oldVersion: defaultConfig.version,
        configVersion: mockFeaturesConfig.data.version,
        type: FeatureConfigConfigDestination.Remote,
      });
    });
    it('should not fail and not emit recalculate event in case of an error', async () => {
      repository.getOrCreate.mockResolvedValue({
        ...mockFeaturesConfig,
        data: plainToClass(FeaturesConfigData, defaultConfig),
      });
      repository.update.mockRejectedValueOnce(new Error('update error'));

      await service['sync']();

      expect(repository.update).toHaveBeenCalledWith(mockFeaturesConfigJson);
      expect(eventEmitter.emit).not.toHaveBeenCalledWith(FeatureServerEvents.FeaturesRecalculate);
      expect(analytics.sendFeatureFlagConfigUpdated).not.toHaveBeenCalled();
    });
  });

  describe('getControlInfo', () => {
    it('should get controlNumber and controlGroup', async () => {
      repository.getOrCreate.mockResolvedValue(mockFeaturesConfig);

      const result = await service['getControlInfo']();

      expect(result).toEqual({
        controlNumber: mockControlNumber,
        controlGroup: mockControlGroup,
      });
    });
  });
});
