import {
  CloudSubscription,
  CloudSubscriptionStatus, CloudSubscriptionType,
  ICloudCapiSubscription,
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

export const mockCloudSubscription = Object.assign(new CloudSubscription(), {
  id: mockCloudCapiSubscription.id,
  type: CloudSubscriptionType.Flexible,
  name: mockCloudCapiSubscription.name,
  numberOfDatabases: mockCloudCapiSubscription.numberOfDatabases,
  provider: mockCloudCapiSubscription.cloudDetails[0].provider,
  region: mockCloudCapiSubscription.cloudDetails[0].regions[0].region,
  status: mockCloudCapiSubscription.status,
});

export const mockCloudSubscriptionFixed = Object.assign(new CloudSubscription(), {
  ...mockCloudSubscription,
  type: CloudSubscriptionType.Fixed,
  price: 2,
});
