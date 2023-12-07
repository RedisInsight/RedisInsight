import { EventEmitter } from 'events';
import { IRedisClientOptions } from 'src/modules/redis/client';

export interface IShardObserver extends EventEmitter {
  disconnect(): void;
  options?: IRedisClientOptions,
}
