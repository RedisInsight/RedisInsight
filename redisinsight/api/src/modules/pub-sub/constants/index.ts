export enum PubSubClientEvents {
  Subscribe = 'subscribe',
  Unsubscribe = 'unsubscribe',
}

export enum SubscriptionType {
  Subscribe = 's',
  PSubscribe = 'p',
  SSubscribe = 'ss',
}

export enum RedisClientStatus {
  Connecting,
  Connected,
  Error,
}

export enum RedisClientEvents {
  Connected = 'connected',
  ConnectionError = 'connection_error',
  Message = 'message',
}
