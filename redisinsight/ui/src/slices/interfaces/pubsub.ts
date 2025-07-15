export interface IPubsubMessage {
  message: string
  channel: string
  time: number
}

export interface SubscriptionDto {
  channel: string
  type: string
}

export interface PubSubSubscription {
  channel: string
  type: string
}

export interface PubSubMessage {
  channel: string
  message: string
  time: number
}

export interface StatePubSub {
  loading: boolean
  publishing: boolean
  error: string
  subscriptions: SubscriptionDto[]
  isSubscribeTriggered: boolean
  isConnected: boolean
  isSubscribed: boolean
  messages: IPubsubMessage[]
  count: number
}
