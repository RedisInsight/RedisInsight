import { Nullable } from 'uiSrc/utils'
import { RedisResponseBuffer } from './app'

export interface StringState {
  loading: boolean
  error: string
  data: {
    key: string
    value: Nullable<RedisResponseBuffer>
  }
}
