import { Nullable } from 'uiSrc/utils'
import { GetAgreementsSpecResponse, GetAppSettingsResponse } from 'apiSrc/modules/settings/dto/settings.dto'

export interface StateUserSettings {
  loading: boolean
  error: string
  isShowConceptsPopup: Nullable<boolean>
  config: Nullable<GetAppSettingsResponse>
  spec: Nullable<GetAgreementsSpecResponse>
  workbench: {
    cleanup: boolean
  }
}

export interface StateUserProfile {
  loading: boolean;
  error: string;
  data?: {
    name: string;
    currentAccountId?: string;
    currentAccountName?: string;
  }
}
