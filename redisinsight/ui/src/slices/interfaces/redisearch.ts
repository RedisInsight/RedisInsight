import { Nullable } from 'uiSrc/utils'
import { RedisResponseBuffer } from './app'
import { KeysStoreData } from './keys'

export interface StateRedisearch {
  loading: boolean
  error: string
  search: string
  data: KeysStoreData
  selectedIndex: Nullable<RedisResponseBuffer>
  list: {
    loading: boolean
    error: string
    data: RedisResponseBuffer[]
  }
  createIndex: {
    loading: boolean
    error: string
  }
}
