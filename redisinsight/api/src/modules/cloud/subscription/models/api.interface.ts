import { CloudSubscriptionPlan } from './cloud-subscription-plan';
import { CloudSubscriptionRegion } from './cloud-subscription-region';

export class CloudSubscriptionPlanResponse extends CloudSubscriptionPlan {
  details: CloudSubscriptionRegion;
}

export interface ICloudApiSubscriptionCloudRegion {
  id: string;
  region_id: number;
  zone_id: null;
  name: string;
  cloud: string;
  support_maz: boolean;
  country_name: string;
  city_name: string;
  flag: string;
  longitude: null;
  latitude: null;
  display_order: number;
}
