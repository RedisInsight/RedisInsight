import * as IORedis from 'ioredis';
import { IMessage } from 'src/modules/pub-sub/interfaces/message.interface';

export interface ISubscription {
  getId(): string;

  getChannel(): string;

  getType(): string;

  pushMessage(message: IMessage): void;

  subscribe(client: IORedis.Redis | IORedis.Cluster): Promise<void>;

  unsubscribe(client: IORedis.Redis | IORedis.Cluster): Promise<void>;
}
