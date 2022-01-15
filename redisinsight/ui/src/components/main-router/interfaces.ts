import { DataTypes, UnsupportedDataTypes } from 'uiSrc/constants'
import { IKeyPropTypes } from 'uiSrc/constants/prop-types/keys'
import { Maybe, Nullable } from 'uiSrc/utils'

export interface RouteParams {
  instanceId: string;
}

export interface Key {
  name: string;
  type: DataTypes;
  ttl: number;
  size: number;
}

export interface KeysStore {
  loading: boolean;
  error: string;
  search: string;
  filter: Nullable<DataTypes | UnsupportedDataTypes>;
  isFiltered: boolean;
  isSearched: boolean;
  data: {
    total: number;
    scanned: number;
    nextCursor: string;
    keys: Key[];
    shardsMeta: Record<string, {
      cursor: number;
      scanned: number;
      total: number;
      host?: string;
      port?: number;
    }>;
    previousResultCount: number;
    lastRefreshTime: Nullable<number>;
  };
  selectedKey: {
    loading: boolean;
    refreshing: boolean;
    lastRefreshTime: Nullable<number>;
    error: string;
    data: Nullable<IKeyPropTypes>;
    length: Maybe<number>;
  };
  addKey: {
    loading: boolean;
    error: string;
  };
}
