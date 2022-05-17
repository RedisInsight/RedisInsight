import { GetStreamEntriesResponse } from 'apiSrc/modules/browser/dto/stream.dto'
import { SortOrder } from 'uiSrc/constants'

export interface StateStream {
  loading: boolean
  error: string
  sortOrder: SortOrder
  data: GetStreamEntriesResponse
}
