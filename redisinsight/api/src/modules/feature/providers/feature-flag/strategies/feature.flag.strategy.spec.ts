import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import {
  mockAgreements,
  mockAgreementsRepository, mockAppSettings,
  mockEncryptionStrategyInstance, mockSettings,
  mockSettingsAnalyticsService, mockSettingsRepository, mockSettingsService,
  MockType, mockUserId
} from 'src/__mocks__';
import { UpdateSettingsDto } from 'src/modules/settings/dto/settings.dto';
import * as AGREEMENTS_SPEC from 'src/constants/agreements-spec.json';
import { AgreementIsNotDefinedException } from 'src/constants';
import config from 'src/utils/config';
import { KeytarEncryptionStrategy } from 'src/modules/encryption/strategies/keytar-encryption.strategy';
import { SettingsAnalytics } from 'src/modules/settings/settings.analytics';
import { SettingsService } from 'src/modules/settings/settings.service';
import { AgreementsRepository } from 'src/modules/settings/repositories/agreements.repository';
import { SettingsRepository } from 'src/modules/settings/repositories/settings.repository';
import { Agreements } from 'src/modules/settings/models/agreements';
import { Settings } from 'src/modules/settings/models/settings';
import { FeaturesConfigService } from 'src/modules/feature/features-config.service';
import { FeatureFlagStrategy } from 'src/modules/feature/providers/feature-flag/strategies/feature.flag.strategy';
import { LiveRecommendationsFlagStrategy } from 'src/modules/feature/providers/feature-flag/strategies/live-recommendations.flag.strategy';

const REDIS_SCAN_CONFIG = config.get('redis_scan');
const WORKBENCH_CONFIG = config.get('workbench');

describe('FeatureFlagStrategy', () => {
  let service: LiveRecommendationsFlagStrategy;
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
        FeaturesConfigService,
      ],
    }).compile();

    settingsService = module.get(SettingsService);
    featuresConfigService = module.get(FeaturesConfigService);
    service = new LiveRecommendationsFlagStrategy(
      featuresConfigService as unknown as FeaturesConfigService,
      settingsService as unknown as SettingsService,
    );
  });

  describe('sync', () => {
    it('should sync', async () => {
      await service['sync']();
    });
  });
});
