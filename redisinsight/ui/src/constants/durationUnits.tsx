import { EuiSuperSelectOption } from '@elastic/eui'

export enum DurationUnits {
  microSeconds = 'µs',
  milliSeconds = 'ms',
}

export const DURATION_UNITS: EuiSuperSelectOption<DurationUnits>[] = [
  {
    inputDisplay: DurationUnits.microSeconds,
    value: DurationUnits.microSeconds,
    'data-test-subj': 'unit-micro-second',
  },
  {
    inputDisplay: 'msec',
    value: DurationUnits.milliSeconds,
    'data-test-subj': 'unit-milli-second',
  },
]

export const MINUS_ONE = -1
export const DEFAULT_SLOWLOG_MAX_LEN = 128
export const DEFAULT_SLOWLOG_SLOWER_THAN = 10
export const DEFAULT_SLOWLOG_DURATION_UNIT = DurationUnits.milliSeconds

export default DURATION_UNITS
