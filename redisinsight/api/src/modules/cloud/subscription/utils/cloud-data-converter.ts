import { get } from 'lodash';
import {
  CloudSubscription, CloudSubscriptionPlan, CloudSubscriptionType, ICloudCapiSubscription, ICloudCapiSubscriptionPlan,
} from 'src/modules/cloud/subscription/models';
import { plainToClass } from 'class-transformer';

export const parseCloudSubscriptionCapiResponse = (
  subscription: ICloudCapiSubscription,
  type: CloudSubscriptionType,
): CloudSubscription => plainToClass(CloudSubscription, {
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
});

export const parseCloudSubscriptionsCapiResponse = (
  subscriptions: ICloudCapiSubscription[],
  type: CloudSubscriptionType,
): CloudSubscription[] => {
  const result: CloudSubscription[] = [];
  if (subscriptions?.length) {
    subscriptions?.forEach?.((subscription): void => {
      result.push(parseCloudSubscriptionCapiResponse(subscription, type));
    });
  }
  return result;
};

export const parseCloudSubscriptionsPlansCapiResponse = (
  plans: ICloudCapiSubscriptionPlan[],
  type: CloudSubscriptionType,
): CloudSubscriptionPlan[] => {
  const result: CloudSubscriptionPlan[] = [];
  if (plans?.length) {
    plans?.forEach?.((plan): void => {
      result.push(plainToClass(CloudSubscriptionPlan, {
        id: plan.id,
        type,
        name: plan.name,
        provider: plan.provider,
        region: plan.region,
        price: plan?.price,
      }));
    });
  }
  return result;
};
