import { AbstractSubscription } from 'src/modules/pub-sub/model/abstract.subscription';
import * as IORedis from 'ioredis';

export class SimpleSubscription extends AbstractSubscription {
  async subscribe(client: IORedis.Redis | IORedis.Cluster): Promise<void> {
    await client.subscribe(this.channel);
  }

  async unsubscribe(client: IORedis.Redis | IORedis.Cluster): Promise<void> {
    await client.unsubscribe(this.channel);
  }
}
