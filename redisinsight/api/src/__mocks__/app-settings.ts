import { IAgreement } from 'src/models';
import {
  AgreementsEntity,
  IAgreementsJSON,
} from 'src/modules/core/models/agreements.entity';
import {
  ISettingsJSON,
  SettingsEntity,
} from 'src/modules/core/models/settings.entity';

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
  toJSON: (): IAgreementsJSON => mockAgreementsJSON,
};

export const mockSettingsJSON: ISettingsJSON = {
  theme: null,
  scanThreshold: null,
};

export const mockSettingsEntity: SettingsEntity = {
  id: 1,
  data: null,
  toJSON: (): ISettingsJSON => mockSettingsJSON,
};
