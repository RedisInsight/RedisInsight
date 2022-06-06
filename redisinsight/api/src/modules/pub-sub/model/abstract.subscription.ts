import { debounce } from 'lodash';
import { SubscriptionType } from 'src/modules/pub-sub/constants';
import { UserClient } from 'src/modules/pub-sub/model/user-client';
import { MessagesResponse, SubscriptionDto } from 'src/modules/pub-sub/dto';
import { ISubscription } from 'src/modules/pub-sub/interfaces/subscription.interface';
import { IMessage } from 'src/modules/pub-sub/interfaces/message.interface';
import * as IORedis from 'ioredis';

export abstract class AbstractSubscription implements ISubscription {
  protected readonly id: string;

  protected readonly userClient: UserClient;

  protected readonly debounce: any;

  protected readonly channel: string;

  protected readonly type: SubscriptionType;

  protected messages: IMessage[] = [];

  constructor(userClient: UserClient, dto: SubscriptionDto) {
    this.userClient = userClient;
    this.channel = dto.channel;
    this.type = dto.type;
    this.id = `${this.type}:${this.channel}`;
    this.debounce = debounce(() => {
      if (this.messages.length) {
        this.userClient.getSocket().emit(this.id, {
          messages: this.messages,
          count: this.messages.length,
        } as MessagesResponse);
        this.messages = [];
      }
    }, 10, {
      maxWait: 50,
    });
  }

  getId() { return this.id; }

  getChannel() { return this.channel; }

  getType() { return this.type; }

  async subscribe(client: IORedis.Redis | IORedis.Cluster): Promise<void> {
    throw new Error('"subscribe" method should be implemented');
  }

  async unsubscribe(client: IORedis.Redis | IORedis.Cluster): Promise<void> {
    throw new Error('"unsubscribe" method should be implemented');
  }

  pushMessage(message: IMessage) {
    this.messages.push(message);

    this.debounce();
  }
}
