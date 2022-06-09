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
  error: string
  subscriptions: PubSubSubscription[]
  isSubscribeTriggered: boolean
  isConnected: boolean
  isSubscribed: boolean
  messages: PubSubMessage[],
  count: number
}
