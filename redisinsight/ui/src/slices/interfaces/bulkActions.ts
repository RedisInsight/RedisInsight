import { BulkActionsType } from 'uiSrc/constants'
import { Nullable } from 'uiSrc/utils'
import { IBulkActionOverview } from 'apiSrc/modules/bulk-actions/interfaces/bulk-action-overview.interface'

export interface StateBulkActions {
  isShowBulkActions: boolean
  loading: boolean
  error: string
  isConnected: boolean
  isActionTriggered: boolean
  selectedBulkAction: SelectedBulkAction
}

export interface SelectedBulkAction {
  id: string
  type: BulkActionsType
  overview: Nullable<IBulkActionOverview>
}
