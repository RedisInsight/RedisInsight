import { RawMode } from '../constants'

export interface ResponseProps {
  command: string
  mode: RawMode
  data?: { response: any, status: string }[]
}
