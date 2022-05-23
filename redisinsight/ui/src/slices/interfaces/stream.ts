import { GetStreamEntriesResponse, StreamEntryDto } from 'apiSrc/modules/browser/dto/stream.dto'
import { SortOrder } from 'uiSrc/constants'
import { Nullable } from 'uiSrc/utils'

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
  data: GetStreamEntriesResponse
  viewType: StreamViewType
  groups: StateConsumerGroups
}

export interface StateConsumerGroups {
  loading: boolean
  error: string
  data: StreamEntryDto[]
  selectedGroup: Nullable<StateSelectedGroup>
}

export interface StateSelectedGroup {
  loading: boolean
  name: string
  data: StreamEntryDto[]
  selectedConsumer: Nullable<StateSelectedConsumer>
}

export interface StateSelectedConsumer {
  loading: boolean
  name: string
  data: StreamEntryDto[]
  selectedMsg: Nullable<StateSelectedMessage>
}

export interface StateSelectedMessage {
  loading: boolean
  name: string
  data: StreamEntryDto[]
}
