import { EventEmitter } from 'events';
import IORedis from 'ioredis';

export interface IShardObserver extends EventEmitter {
  disconnect(): void;
  options?: IORedis.RedisOptions,
}
