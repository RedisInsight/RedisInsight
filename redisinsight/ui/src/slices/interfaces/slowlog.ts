import { SlowLog, SlowLogConfig } from 'apiSrc/modules/slow-log/models'
import { DurationUnits } from 'uiSrc/constants'
import { Nullable } from 'uiSrc/utils'

export interface StateSlowLog {
  loading: boolean
  error: string
  data: SlowLog[]
  lastRefreshTime: Nullable<number>,
  config: Nullable<SlowLogConfig>,
  durationUnit: DurationUnits
}
