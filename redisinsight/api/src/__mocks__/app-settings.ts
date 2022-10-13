import { IAgreement } from 'src/models';
import { AgreementsEntity } from 'src/modules/settings/entities/agreements.entity';
import { SettingsEntity } from 'src/modules/settings/entities/settings.entity';

export const mockAppAgreement: IAgreement = {
  defaultValue: false,
  required: true,
  since: '1.0.0',
  disabled: false,
  displayInSetting: false,
  editable: false,
  title: 'License Terms',
  label: 'I have read and understood the License Terms',
};

export const mockAgreementsJSON = {
  version: null,
};

export const mockAgreementsEntity: AgreementsEntity = {
  id: 1,
  version: null,
  data: null,
};

export const mockSettingsJSON = {
  theme: null,
  scanThreshold: null,
  batchSize: null,
};

export const mockSettingsEntity: SettingsEntity = {
  id: 1,
  data: null,
};
