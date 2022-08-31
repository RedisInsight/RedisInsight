import { DurationUnits } from 'uiSrc/constants'
import { Nullable } from 'uiSrc/utils'
import { SlowLog, SlowLogConfig } from 'apiSrc/modules/slow-log/models'
import { ClusterDetails } from 'apiSrc/modules/cluster-monitor/models/cluster-details'

export interface StateSlowLog {
  loading: boolean
  error: string
  data: SlowLog[]
  lastRefreshTime: Nullable<number>,
  config: Nullable<SlowLogConfig>,
  durationUnit: DurationUnits
}

export interface StateClusterDetails {
  loading: boolean
  error: string
  data: Nullable<ClusterDetails>
}

export interface StateAnalyticsSettings {
  viewTab: AnalyticsViewTab
}

export enum AnalyticsViewTab {
  ClusterDetails = 'ClusterDetails',
  SlowLog = 'SlowLog',
}
