export enum PubSubClientEvents {
  Subscribe = 'subscribe',
  Unsubscribe = 'unsubscribe',
}

export enum PubSubServerEvents {
  Exception = 'exception',
}

export enum SubscriptionType {
  Subscribe = 's',
  PSubscribe = 'p',
  SSubscribe = 'ss',
}

export enum RedisClientStatus {
  Connecting = 'connecting',
  Connected = 'connected',
  Error = 'error',
  End = 'end',
}

export enum RedisClientEvents {
  Connected = 'connected',
  ConnectionError = 'connection_error',
  Message = 'message',
  End = 'end',
}
