import { SettingsRepository } from 'src/modules/core/repositories/settings.repository';
import { SettingsAnalyticsService } from 'src/modules/core/services/settings-analytics/settings-analytics.service';
import { KeytarEncryptionStrategy } from 'src/modules/core/encryption/strategies/keytar-encryption.strategy';
import { SettingsOnPremiseService } from './settings-on-premise.service';
import { AgreementsRepository } from '../../repositories/agreements.repository';

export default {
  provide: 'SETTINGS_PROVIDER',
  useFactory: (
    agreementsRepository: AgreementsRepository,
    settingsRepository: SettingsRepository,
    analyticsService: SettingsAnalyticsService,
    keytarEncryptionStrategy: KeytarEncryptionStrategy,
  ) => new SettingsOnPremiseService(
    agreementsRepository,
    settingsRepository,
    analyticsService,
    keytarEncryptionStrategy,
  ),
  inject: [
    AgreementsRepository,
    SettingsRepository,
    SettingsAnalyticsService,
    KeytarEncryptionStrategy,
  ],
};
