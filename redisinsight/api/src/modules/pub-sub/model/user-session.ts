import { RedisClient } from 'src/modules/pub-sub/model/redis-client';
import { UserClient } from 'src/modules/pub-sub/model/user-client';
import { ISubscription } from 'src/modules/pub-sub/interfaces/subscription.interface';
import { IMessage } from 'src/modules/pub-sub/interfaces/message.interface';
import { RedisClientEvents } from 'src/modules/pub-sub/constants';

export class UserSession {
  private readonly id: string;

  private readonly userClient: UserClient;

  private readonly redisClient: RedisClient;

  private subscriptions: Map<string, ISubscription> = new Map();

  constructor(userClient: UserClient, redisClient: RedisClient) {
    this.id = userClient.getId();
    this.userClient = userClient;
    this.redisClient = redisClient;
    redisClient.on(RedisClientEvents.Message, this.handleMessage.bind(this));
  }

  getId() { return this.id; }

  getUserClient() { return this.userClient; }

  getRedisClient() { return this.redisClient; }

  async addSubscription(subscription: ISubscription) {
    const client = await this.redisClient?.getClient();

    if (!client) { throw new Error('There is no Redis client initialized'); }

    if (!this.subscriptions.has(subscription.getId())) {
      this.subscriptions.set(subscription.getId(), subscription);
      await subscription.subscribe(client);
    }
  }

  handleMessage(id: string, message: IMessage) {
    const subscription = this.subscriptions.get(id);

    if (subscription) {
      subscription.pushMessage(message);
    }
  }

  destroy() {
    // todo: redisClient destroy
  }
}
