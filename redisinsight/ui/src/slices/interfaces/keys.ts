import { KeyTypes, UnsupportedKeyTypes } from 'uiSrc/constants'
import { IKeyPropTypes } from 'uiSrc/constants/prop-types/keys'
import { Maybe, Nullable } from 'uiSrc/utils'

export interface Key {
  name: string
  type: KeyTypes
  ttl: number
  size: number
  length: number
}

export enum KeyViewType {
  Browser = 'Browser',
  Tree = 'Tree',
}

export interface KeysStore {
  loading: boolean
  error: string
  search: string
  filter: Nullable<KeyTypes | UnsupportedKeyTypes>
  isFiltered: boolean
  isSearched: boolean
  isBrowserFullScreen: boolean
  viewType: KeyViewType
  data: {
    total: number
    scanned: number
    nextCursor: string
    keys: Key[]
    shardsMeta: Record<string, {
      cursor: number
      scanned: number
      total: number
      host?: string
      port?: number
    }>
    previousResultCount: number
    lastRefreshTime: Nullable<number>
  };
  selectedKey: {
    loading: boolean
    refreshing: boolean
    lastRefreshTime: Nullable<number>
    error: string
    data: Nullable<IKeyPropTypes>
    length: Maybe<number>
  }
  addKey: {
    loading: boolean
    error: string
  };
}
