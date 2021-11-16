export interface IRedisCloudSubscriptionsResponse {
  accountId: number;
  subscriptions: IRedisCloudSubscription[];
}

export interface IRedisCloudSubscription {
  id: number;
  name: string;
  status: RedisCloudSubscriptionStatus;
  paymentMethodId: number;
  memoryStorage: string;
  storageEncryption: boolean;
  numberOfDatabases: number;
  subscriptionPricing: IRedisCloudSubscriptionPricing[];
  cloudDetails: IRedisCloudSubscriptionCloudDetails[];
}

interface IRedisCloudSubscriptionCloudDetails {
  provider: string;
  cloudAccountId: number;
  totalSizeInGb: number;
  regions: IRedisCloudSubscriptionRegion[];
}

interface IRedisCloudSubscriptionPricing {
  type: string;
  typeDetails?: string;
  quantity: number;
  quantityMeasurement: string;
  pricePerUnit?: number;
  priceCurrency?: string;
  pricePeriod?: string;
}

interface IRedisCloudSubscriptionRegion {
  region: string;
  networking: any[];
  preferredAvailabilityZones: string[];
  multipleAvailabilityZones: boolean;
}

export enum RedisCloudSubscriptionStatus {
  Active = 'active',
  NotActivated = 'not_activated',
  Deleting = 'deleting',
  Pending = 'pending',
  Error = 'error',
}
