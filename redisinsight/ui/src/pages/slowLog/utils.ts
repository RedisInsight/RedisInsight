import { DurationUnits } from 'uiSrc/pages/slowLog/interfaces'

// convert from microSeconds
export const convertNumberByUnits = (number: number, unit: DurationUnits): number => {
  if (unit === DurationUnits.milliSeconds) {
    return number / 1000
  }
  return number
}
