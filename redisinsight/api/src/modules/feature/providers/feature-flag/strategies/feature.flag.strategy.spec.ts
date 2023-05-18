import { Test, TestingModule } from '@nestjs/testing';
import {
  mockAppSettings,
  mockFeaturesConfig,
  mockFeaturesConfigDataComplex,
  mockFeaturesConfigService,
  mockServerState,
  mockSettingsService,
  MockType,
} from 'src/__mocks__';
import { SettingsService } from 'src/modules/settings/settings.service';
import { FeaturesConfigService } from 'src/modules/feature/features-config.service';
import { FeatureFlagStrategy } from 'src/modules/feature/providers/feature-flag/strategies/feature.flag.strategy';
import {
  LiveRecommendationsFlagStrategy,
} from 'src/modules/feature/providers/feature-flag/strategies/live-recommendations.flag.strategy';
import { FeatureConfigFilter, FeatureConfigFilterCondition } from 'src/modules/feature/model/features-config';

describe('FeatureFlagStrategy', () => {
  let service: FeatureFlagStrategy;
  let settingsService: MockType<SettingsService>;
  let featuresConfigService: MockType<FeaturesConfigService>;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: SettingsService,
          useFactory: mockSettingsService,
        },
        {
          provide: FeaturesConfigService,
          useFactory: mockFeaturesConfigService,
        },
      ],
    }).compile();

    settingsService = module.get(SettingsService);
    featuresConfigService = module.get(FeaturesConfigService);
    service = new LiveRecommendationsFlagStrategy(
      featuresConfigService as unknown as FeaturesConfigService,
      settingsService as unknown as SettingsService,
    );

    settingsService.getAppSettings.mockResolvedValue(mockAppSettings);
  });

  describe('isInTargetRange', () => {
    const testCases = [
      [[], false], // disable for all
      [[[0, 100]], true],
      [[[0, 50]], true],
      [[[0, 1], [2, 3], [5, 10]], true],
      [[[0, 1]], false],
      [[[5, -600]], false],
      [[[100, -600]], false],
      [[[0, 0]], false],
      [[[0, mockFeaturesConfig.controlNumber]], false],
      [[[0, mockFeaturesConfig.controlNumber + 0.01]], true],
    ];

    testCases.forEach((tc) => {
      it(`should return ${tc[1]} for range: [${tc[0]}]`, async () => {
        expect(await service['isInTargetRange'](tc[0] as number[][])).toEqual(tc[1]);
      });
    });

    it('should return false in case of any error', async () => {
      featuresConfigService.getControlInfo.mockRejectedValueOnce(new Error('unable to get control info'));

      expect(await service['isInTargetRange']([[0, 100]])).toEqual(false);
    });
  });

  describe('getServerState', () => {
    it('should return server state', async () => {
      expect(await service['getServerState']()).toEqual(mockServerState);
    });
    it('should return nulls in case of any error', async () => {
      settingsService.getAppSettings.mockRejectedValueOnce(new Error('unable to get app settings'));

      expect(await service['getServerState']()).toEqual({
        ...mockServerState,
        agreements: null,
        settings: null,
      });
    });
  });

  describe('filter', () => {
    it('should return true for single filter by agreements (eq)', async () => {
      expect(await service['filter']([
        Object.assign(new FeatureConfigFilter(), {
          name: 'agreements.analytics',
          value: true,
          cond: FeatureConfigFilterCondition.Eq,
        }),
      ])).toEqual(true);
    });
    it('should return false for single filter by agreements (eq)', async () => {
      settingsService.getAppSettings.mockResolvedValue({
        ...mockAppSettings,
        agreements: {
          ...mockAppSettings.agreements,
          analytics: false,
        },
      });

      expect(await service['filter']([
        Object.assign(new FeatureConfigFilter(), {
          name: 'agreements.analytics',
          value: true,
          cond: FeatureConfigFilterCondition.Eq,
        }),
      ])).toEqual(false);
    });
    it('should return false for single filter by agreements (neq)', async () => {
      expect(await service['filter']([
        Object.assign(new FeatureConfigFilter(), {
          name: 'agreements.analytics',
          value: true,
          cond: FeatureConfigFilterCondition.Neq,
        }),
      ])).toEqual(false);
    });
    it('should return false for unsupported condition (unsupported)', async () => {
      expect(await service['filter']([
        Object.assign(new FeatureConfigFilter(), {
          name: 'agreements.analytics',
          value: true,
          cond: 'unsupported' as FeatureConfigFilterCondition,
        }),
      ])).toEqual(false);
    });
    it('should return false numeric settings (eq)', async () => {
      expect(await service['filter']([
        Object.assign(new FeatureConfigFilter(), {
          name: 'settings.scanThreshold',
          value: mockAppSettings.scanThreshold,
          cond: FeatureConfigFilterCondition.Eq,
        }),
      ])).toEqual(true);
    });
    it('should return false for numeric settings (gt)', async () => {
      expect(await service['filter']([
        Object.assign(new FeatureConfigFilter(), {
          name: 'settings.scanThreshold',
          value: mockAppSettings.scanThreshold,
          cond: FeatureConfigFilterCondition.Gt,
        }),
      ])).toEqual(false);
    });
    it('should return true for numeric settings (gt)', async () => {
      expect(await service['filter']([
        Object.assign(new FeatureConfigFilter(), {
          name: 'settings.scanThreshold',
          value: mockAppSettings.scanThreshold - 1,
          cond: FeatureConfigFilterCondition.Gt,
        }),
      ])).toEqual(true);
    });
    it('should return true numeric settings (gte)', async () => {
      expect(await service['filter']([
        Object.assign(new FeatureConfigFilter(), {
          name: 'settings.scanThreshold',
          value: mockAppSettings.scanThreshold,
          cond: FeatureConfigFilterCondition.Gte,
        }),
      ])).toEqual(true);
    });
    it('should return false for numeric settings (lt)', async () => {
      expect(await service['filter']([
        Object.assign(new FeatureConfigFilter(), {
          name: 'settings.scanThreshold',
          value: mockAppSettings.scanThreshold,
          cond: FeatureConfigFilterCondition.Lt,
        }),
      ])).toEqual(false);
    });
    it('should return true for numeric settings (lt)', async () => {
      expect(await service['filter']([
        Object.assign(new FeatureConfigFilter(), {
          name: 'settings.scanThreshold',
          value: mockAppSettings.scanThreshold + 1,
          cond: FeatureConfigFilterCondition.Lt,
        }),
      ])).toEqual(true);
    });
    it('should return true numeric settings (lte)', async () => {
      expect(await service['filter']([
        Object.assign(new FeatureConfigFilter(), {
          name: 'settings.scanThreshold',
          value: mockAppSettings.scanThreshold,
          cond: FeatureConfigFilterCondition.Lte,
        }),
      ])).toEqual(true);
    });

    it('should return false in case of an error', async () => {
      const spy = jest.spyOn(service as any, 'getServerState');
      spy.mockRejectedValueOnce(new Error('unable to get state'));

      expect(await service['filter']([
        Object.assign(new FeatureConfigFilter(), {
          name: 'agreements.analytics',
          value: true,
          cond: FeatureConfigFilterCondition.Eq,
        }),
      ])).toEqual(false);
    });
  });

  describe('filter (complex)', () => {
    it('should return true since 2nd or is true', async () => {
      settingsService.getAppSettings.mockResolvedValueOnce({
        ...mockAppSettings,
        agreements: { analytics: true },
      });

      expect(
        await service['filter'](mockFeaturesConfigDataComplex.features.get('liveRecommendations').filters),
      ).toEqual(true);
    });
    it('should return false since all 2 or conditions are false', async () => {
      settingsService.getAppSettings.mockResolvedValueOnce({
        ...mockAppSettings,
        agreements: { analytics: false },
      });

      expect(
        await service['filter'](mockFeaturesConfigDataComplex.features.get('liveRecommendations').filters),
      ).toEqual(false);
    });
    it('should return true since all 1st or is true', async () => {
      settingsService.getAppSettings.mockResolvedValueOnce({
        ...mockAppSettings,
        testValue: 'test',
        agreements: { analytics: false },
      });

      expect(
        await service['filter'](mockFeaturesConfigDataComplex.features.get('liveRecommendations').filters),
      ).toEqual(true);
    });
  });
});
