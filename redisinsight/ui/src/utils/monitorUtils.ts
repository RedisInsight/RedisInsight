import { format } from 'date-fns'

export const getFormatTime = (time: string = '') =>
  format(new Date(+time * 1_000), 'HH:mm:ss.SSS')
