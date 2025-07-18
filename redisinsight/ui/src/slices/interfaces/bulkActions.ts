import { BulkActionsStatus, BulkActionsType } from 'uiSrc/constants'
import { Nullable } from 'uiSrc/utils'

interface IBulkActionProgressOverview {
  total: number
  scanned: number
}

interface IBulkActionSummaryOverview {
  processed: number
  succeed: number
  failed: number
  errors: Array<Record<string, string>>
  keys: Array<string | Buffer>
}

interface IBulkActionFilterOverview {
  type: string
  match: string
}

interface IBulkActionOverviewBE {
  id: string
  databaseId: string
  duration: number
  type: string
  status: string
  filter: IBulkActionFilterOverview
  progress: IBulkActionProgressOverview
  summary: IBulkActionSummaryOverview
}

export interface IBulkActionOverview
  extends Omit<IBulkActionOverviewBE, 'status'> {
  status: BulkActionsStatus
}

export interface StateBulkActions {
  isShowBulkActions: boolean
  loading: boolean
  error: string
  isConnected: boolean
  selectedBulkAction: SelectedBulkAction
  bulkDelete: {
    isActionTriggered: boolean
    loading: boolean
    error: string
    overview: Nullable<IBulkActionOverview>
  }
  bulkUpload: {
    loading: boolean
    error: string
    overview: Nullable<IBulkActionOverview>
    fileName?: string
  }
}

export interface SelectedBulkAction {
  id: string
  type: Nullable<BulkActionsType>
}
