import { format } from 'date-fns'

export const getFormatTime = (time: string = '') =>
  format(new Date(+time), 'HH:mm:ss.SSS d MMM yyyy')

export const getTimestampFromId = (id: string = ''): number =>
  parseInt(id.split('-')[0], 10)
