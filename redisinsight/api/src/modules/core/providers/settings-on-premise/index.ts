import { SettingsOnPremiseService } from './settings-on-premise.service';

export default {
  provide: 'SETTINGS_PROVIDER',
  useClass: SettingsOnPremiseService,
};
