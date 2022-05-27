import { SortOrder } from 'uiSrc/constants'
import { Nullable } from 'uiSrc/utils'
import {
  ConsumerDto,
  ConsumerGroupDto,
  GetStreamEntriesResponse,
  PendingEntryDto,
} from 'apiSrc/modules/browser/dto/stream.dto'

type Range = {
  start: string
  end: string
}

export enum StreamViewType {
  Data = 'Data',
  Groups = 'Groups',
  Consumers = 'Consumers',
  Messages = 'Messages',
}

export interface StateStream {
  loading: boolean
  error: string
  sortOrder: SortOrder
  range: Range
  data: StateStreamData
  viewType: StreamViewType
  groups: StateConsumerGroups
}

export interface StateStreamData extends GetStreamEntriesResponse {
  lastRefreshTime: Nullable<number>
}

export interface StateConsumerGroups {
  loading: boolean
  error: string
  data: ConsumerGroupDto[]
  selectedGroup: Nullable<StateSelectedGroup>
  lastRefreshTime: Nullable<number>
}

export interface StateSelectedGroup {
  loading: boolean
  name: string
  data: ConsumerDto[]
  selectedConsumer: Nullable<StateSelectedConsumer>
  lastRefreshTime: Nullable<number>
}

export interface StateSelectedConsumer {
  loading: boolean
  name: string
  data: PendingEntryDto[]
  lastRefreshTime: Nullable<number>
}
