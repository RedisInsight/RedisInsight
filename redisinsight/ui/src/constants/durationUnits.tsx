import { EuiSuperSelectOption } from '@elastic/eui'

export enum DurationUnits {
  microSeconds = 'µs',
  milliSeconds = 'ms'
}

export const DURATION_UNITS: EuiSuperSelectOption<DurationUnits>[] = [
  {
    inputDisplay: DurationUnits.microSeconds,
    value: DurationUnits.microSeconds,
  },
  {
    inputDisplay: DurationUnits.milliSeconds,
    value: DurationUnits.milliSeconds,
  },
]

export const DEFAULT_SLOWLOG_MAX_LEN = 128
export const DEFAULT_SLOWLOG_SLOWER_THAN = 10000
export const DEFAULT_SLOWLOG_DURATION_UNIT = DurationUnits.microSeconds

export default DURATION_UNITS
