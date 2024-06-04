import { addMilliseconds, format, formatDistanceToNow } from 'date-fns'
import { truncateNumberToFirstUnit } from './truncateTTL'

export const lastConnectionFormat = (date?: Date) => (date
  ? `${formatDistanceToNow(new Date(date), { addSuffix: true })}`
  : 'Never')

export const millisecondsFormat = (milliseconds: number, formatMask: string = 'HH:mm:ss.SSS') => {
  const d = new Date(0)
  return format(
    addMilliseconds(new Date(milliseconds + d.getTimezoneOffset() * 1000 * 60), 0),
    formatMask
  )
}

export const truncateMilliseconds = (milliseconds: number): string => {
  if (milliseconds < 1000) {
    return `${milliseconds} msec`
  }

  return truncateNumberToFirstUnit(milliseconds / 1000)
}

export const secondsToMinutes = (time: number) => {
  if (time < 60) {
    return `${time} second${time === 1 ? '' : 's'}`
  }
  const minutes = Math.floor(time / 60)
  return `${minutes} minute${minutes === 1 ? '' : 's'}`
}
