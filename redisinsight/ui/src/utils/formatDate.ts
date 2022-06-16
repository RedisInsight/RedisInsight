import { formatDistanceToNow } from 'date-fns'

export const lastConnectionFormat = (date?: Date) => (date
  ? `${formatDistanceToNow(new Date(date), { addSuffix: true })}`
  : 'Never')
