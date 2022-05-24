import { format } from 'date-fns'
import { SCAN_STREAM_START_DEFAULT, SCAN_STREAM_END_DEFAULT } from 'uiSrc/constants/api'

export const getFormatTime = (time: string = '') =>
  format(new Date(+time), 'HH:mm:ss.SSS d MMM yyyy')

export const getTimestampFromId = (id: string = ''): number =>
  parseInt(id.split('-')[0], 10)

export const getStreamRangeStart = (start: string, firstEntryId: string) => {
  if (start === '' || !firstEntryId || start === getTimestampFromId(firstEntryId).toString()) {
    return SCAN_STREAM_START_DEFAULT
  }
  return start
}

export const getStreamRangeEnd = (end: string, endEtryId: string) => {
  if (end === '' || !endEtryId || end === getTimestampFromId(endEtryId).toString()) {
    return SCAN_STREAM_END_DEFAULT
  }
  return end
}
