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
