import { Nullable } from 'uiSrc/utils'
import { GetAgreementsSpecResponse, GetAppSettingsResponse } from 'apiSrc/dto/settings.dto'

export interface StateUserSettings {
  loading: boolean;
  error: string;
  isShowConceptsPopup: boolean;
  config: Nullable<GetAppSettingsResponse>;
  spec: Nullable<GetAgreementsSpecResponse>;
}
