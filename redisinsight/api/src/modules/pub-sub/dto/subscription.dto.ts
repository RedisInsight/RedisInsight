import { SubscriptionType } from 'src/modules/pub-sub/constants';

export class SubscriptionDto {
  channel: string;

  type: SubscriptionType;
}
