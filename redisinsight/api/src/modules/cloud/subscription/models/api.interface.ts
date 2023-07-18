import { CloudSubscriptionPlan } from './cloud-subscription-plan';
import { CloudSubscriptionRegion } from './cloud-subscription-region';

export class CloudSubscriptionPlanResponse extends CloudSubscriptionPlan {
  details: CloudSubscriptionRegion;
}
