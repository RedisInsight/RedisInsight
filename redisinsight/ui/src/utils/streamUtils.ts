import { format } from 'date-fns'

export const getFormatTime = (time: string = '') =>
  format(new Date(+time), 'HH:mm:ss.SSS d MMM yyyy')
