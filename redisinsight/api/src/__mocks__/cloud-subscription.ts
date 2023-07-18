import {
  CloudSubscription,
  CloudSubscriptionPlan,
  CloudSubscriptionPlanResponse,
  CloudSubscriptionRegion,
  CloudSubscriptionStatus, CloudSubscriptionType,
  ICloudCapiSubscription,
  ICloudCapiSubscriptionCloudRegion,
} from 'src/modules/cloud/subscription/models';

export const mockCloudCapiSubscription: ICloudCapiSubscription = {
  id: 108353,
  name: 'external CA',
  status: CloudSubscriptionStatus.Active,
  paymentMethodId: 8240,
  memoryStorage: 'ram',
  storageEncryption: false,
  numberOfDatabases: 7,
  subscriptionPricing: [
    {
      type: 'Shards',
      typeDetails: 'high-throughput',
      quantity: 2,
      quantityMeasurement: 'shards',
      pricePerUnit: 0.124,
      priceCurrency: 'USD',
      pricePeriod: 'hour',
    },
  ],
  cloudDetails: [
    {
      provider: 'AWS',
      cloudAccountId: 16424,
      totalSizeInGb: 0.0323,
      regions: [
        {
          region: 'us-east-1',
          networking: [
            {
              deploymentCIDR: '10.0.0.0/24',
              subnetId: 'subnet-0a2dd5829daf83024',
            },
          ],
          preferredAvailabilityZones: ['us-east-1a'],
          multipleAvailabilityZones: false,
        },
      ],
    },
  ],
  price: 2,
};

export const mockCloudCapiSubscriptionFixed: ICloudCapiSubscription = {
  ...mockCloudCapiSubscription,
  price: 0,
};

export const mockCloudSubscription = Object.assign(new CloudSubscription(), {
  id: mockCloudCapiSubscription.id,
  type: CloudSubscriptionType.Flexible,
  name: mockCloudCapiSubscription.name,
  numberOfDatabases: mockCloudCapiSubscription.numberOfDatabases,
  provider: mockCloudCapiSubscription.cloudDetails[0].provider,
  region: mockCloudCapiSubscription.cloudDetails[0].regions[0].region,
  status: mockCloudCapiSubscription.status,
  price: mockCloudCapiSubscription.price,
});

export const mockCloudSubscriptionFixed = Object.assign(new CloudSubscription(), {
  ...mockCloudSubscription,
  type: CloudSubscriptionType.Fixed,
  price: mockCloudCapiSubscriptionFixed.price,
});

export const mockCloudCapiCloudRegion1: ICloudCapiSubscriptionCloudRegion = {
  id: '1',
  region_id: 1,
  zone_id: null,
  name: 'us-east-1',
  cloud: 'aws',
  support_maz: true,
  country_name: 'USA',
  city_name: 'Vegas',
  flag: 'fr',
  longitude: null,
  latitude: null,
  display_order: 1,
};

export const mockCloudCapiCloudRegion2: ICloudCapiSubscriptionCloudRegion = {
  id: '2',
  region_id: 2,
  zone_id: null,
  name: 'asia-northeast2',
  cloud: 'gpc',
  support_maz: true,
  country_name: 'Poland',
  city_name: 'Warsaw',
  flag: 'pl',
  longitude: null,
  latitude: null,
  display_order: 2,
};

export const mockCloudCapiCloudRegions: ICloudCapiSubscriptionCloudRegion[] = [
  mockCloudCapiCloudRegion1,
  mockCloudCapiCloudRegion2,
];

export const mockFreeCloudSubscriptionPlan1: CloudSubscriptionPlan = {
  id: 1,
  type: CloudSubscriptionType.Fixed,
  name: 'plan_name',
  provider: 'AWS',
  region: 'us-east-1',
  price: 0,
};

export const mockFreeCloudSubscriptionPlan2: CloudSubscriptionPlan = {
  id: 2,
  type: CloudSubscriptionType.Fixed,
  name: 'plan_name2',
  provider: 'GCP',
  region: 'asia-northeast2',
  price: 0,
};

export const mockFreeCloudSubscriptionPlans: CloudSubscriptionPlan[] = [
  mockFreeCloudSubscriptionPlan1,
  mockFreeCloudSubscriptionPlan2,
];

export const mockCloudSubscriptionRegion1 = Object.assign(new CloudSubscriptionRegion(), {
  id: mockFreeCloudSubscriptionPlan1.id,
  cityName: mockCloudCapiCloudRegion1.city_name,
  cloud: mockCloudCapiCloudRegion1.cloud,
  countryName: mockCloudCapiCloudRegion1.country_name,
  displayOrder: mockCloudCapiCloudRegion1.display_order,
  flag: mockCloudCapiCloudRegion1.flag,
  name: mockCloudCapiCloudRegion1.name,
});

export const mockCloudSubscriptionRegion2 = Object.assign(new CloudSubscriptionRegion(), {
  id: mockFreeCloudSubscriptionPlan2.id,
  cityName: mockCloudCapiCloudRegion2.city_name,
  cloud: mockCloudCapiCloudRegion2.cloud,
  countryName: mockCloudCapiCloudRegion2.country_name,
  displayOrder: mockCloudCapiCloudRegion2.display_order,
  flag: mockCloudCapiCloudRegion2.flag,
  name: mockCloudCapiCloudRegion2.name,
});

export const mockCloudSubscriptionRegions: CloudSubscriptionRegion[] = [
  mockCloudSubscriptionRegion1,
  mockCloudSubscriptionRegion2,
];

export const mockSubscriptionPlanResponse: CloudSubscriptionPlanResponse[] = [
  {
    ...mockFreeCloudSubscriptionPlan1,
    type: CloudSubscriptionType.Fixed,
    details: {
      ...mockCloudSubscriptionRegion1,
    },
  },
  {
    type: CloudSubscriptionType.Fixed,
    ...mockFreeCloudSubscriptionPlan2,
    details: {
      ...mockCloudSubscriptionRegion2,
    },
  },
];

export const mockCloudSubscriptionApiProvider = jest.fn(() => ({
  getCloudRegions: jest.fn().mockResolvedValue(mockCloudCapiCloudRegions),
}));

export const mockCloudSubscriptionCapiService = jest.fn(() => ({
  getSubscriptionsPlans: jest.fn().mockResolvedValue(mockFreeCloudSubscriptionPlans),
}));
