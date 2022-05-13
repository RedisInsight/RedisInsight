import { SlowLog } from 'src/modules/slow-log/models'
import { Nullable } from 'uiSrc/utils'

export interface SlowLogConfig {
  slowlogLogSlowerThan: number
  slowlogMaxLen: number
}

export interface StateSlowLog {
  loading: boolean
  error: string
  data: SlowLog[]
  config: Nullable<SlowLogConfig>
}
