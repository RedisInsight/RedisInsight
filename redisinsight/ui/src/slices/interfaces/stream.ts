import { GetStreamEntriesResponse } from 'apiSrc/modules/browser/dto/stream.dto'
import { SortOrder } from 'uiSrc/constants'

type Range = {
  start: string,
  end: string,
}

export interface StateStream {
  loading: boolean
  error: string
  sortOrder: SortOrder
  range: Range,
  data: GetStreamEntriesResponse
}
