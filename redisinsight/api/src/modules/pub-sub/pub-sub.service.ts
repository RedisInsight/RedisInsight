import { Injectable, Logger } from '@nestjs/common';
import { UserSessionProvider } from 'src/modules/pub-sub/providers/user-session.provider';
import { UserClient } from 'src/modules/pub-sub/model/user-client';
import { SubscribeDto } from 'src/modules/pub-sub/dto';
import { SubscriptionProvider } from 'src/modules/pub-sub/providers/subscription.provider';

@Injectable()
export class PubSubService {
  private logger: Logger = new Logger('PubSubService');

  constructor(
    private readonly sessionProvider: UserSessionProvider,
    private readonly subscriptionProvider: SubscriptionProvider,
  ) {}

  async subscribe(userClient: UserClient, dto: SubscribeDto) {
    try {
      const session = await this.sessionProvider.getOrCreateUserSession(userClient);
      await Promise.all(dto.subscriptions.map((subDto) => session.subscribe(
        this.subscriptionProvider.createSubscription(userClient, subDto),
      )));
    } catch (e) {
      this.logger.error('Unable to create subscriptions', e);
      throw e;
    }
  }

  async unsubscribe(userClient: UserClient, dto: SubscribeDto) {
    try {
      const session = await this.sessionProvider.getOrCreateUserSession(userClient);
      await Promise.all(dto.subscriptions.map((subDto) => session.unsubscribe(
        this.subscriptionProvider.createSubscription(userClient, subDto),
      )));
    } catch (e) {
      this.logger.error('Unable to create subscriptions', e);
    }
  }

  async handleDisconnect(id: string) {
    const session = this.sessionProvider.getUserSession(id);

    if (session) {
      session.destroy();
      this.sessionProvider.removeUserSession(id);
    }
  }
}
