import { get } from 'lodash';
import {
  CloudSubscription, CloudSubscriptionType, ICloudCapiSubscription,
} from 'src/modules/cloud/subscription/models';
import { plainToClass } from 'class-transformer';

export const parseCloudSubscriptionsCapiResponse = (
  subscriptions: ICloudCapiSubscription[],
  type: CloudSubscriptionType,
): CloudSubscription[] => {
  const result: CloudSubscription[] = [];
  if (subscriptions?.length) {
    subscriptions?.forEach?.((subscription): void => {
      result.push(plainToClass(CloudSubscription, {
        id: subscription.id,
        type,
        name: subscription.name,
        numberOfDatabases: subscription.numberOfDatabases,
        status: subscription.status,
        provider: get(subscription, ['cloudDetails', 0, 'provider'], get(subscription, 'provider')),
        region: get(subscription, [
          'cloudDetails',
          0,
          'regions',
          0,
          'region',
        ], get(subscription, 'region')),
        price: subscription?.price,
      }));
    });
  }
  return result;
};
