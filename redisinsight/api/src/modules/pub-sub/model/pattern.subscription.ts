import { AbstractSubscription } from 'src/modules/pub-sub/model/abstract.subscription';
import * as IORedis from 'ioredis';

export class PatternSubscription extends AbstractSubscription {
  async subscribe(client: IORedis.Redis | IORedis.Cluster): Promise<void> {
    await client.psubscribe(this.channel);
  }
}
