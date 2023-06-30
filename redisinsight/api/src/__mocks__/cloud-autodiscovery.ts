import {
  CloudAccountInfo,
  CloudDatabase, CloudDatabaseProtocol,
  CloudDatabaseStatus,
  CloudSubscription,
  CloudSubscriptionStatus, CloudSubscriptionType, ICloudApiAccount, ICloudApiDatabase, ICloudApiSubscription,
} from 'src/modules/cloud/autodiscovery/models';
import {
  AddCloudDatabaseDto, AddCloudDatabaseResponse,
  CloudAuthDto,
  GetCloudSubscriptionDatabaseDto,
  GetCloudSubscriptionDatabasesDto,
} from 'src/modules/cloud/autodiscovery/dto';
import { ActionStatus } from 'src/common/models';

export const mockCloudApiAccount: ICloudApiAccount = {
  id: 40131,
  name: 'Redis Labs',
  createdTimestamp: '2018-12-23T15:15:31Z',
  updatedTimestamp: '2020-06-03T13:16:59Z',
  key: {
    name: 'QA-HashedIn-Test-API-Key-2',
    accountId: 40131,
    accountName: 'Redis Labs',
    allowedSourceIps: ['0.0.0.0/0'],
    createdTimestamp: '2020-04-06T09:22:38Z',
    owner: {
      name: 'Cloud Account',
      email: 'cloud.account@redislabs.com',
    },
    httpSourceIp: '198.141.36.229',
  },
};

export const mockCloudAccountInfo = Object.assign(new CloudAccountInfo(), {
  accountId: mockCloudApiAccount.id,
  accountName: mockCloudApiAccount.name,
  ownerEmail: mockCloudApiAccount.key.owner.email,
  ownerName: mockCloudApiAccount.key.owner.name,
});

export const mockCloudApiSubscription: ICloudApiSubscription = {
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
};

export const mockCloudSubscription = Object.assign(new CloudSubscription(), {
  id: mockCloudApiSubscription.id,
  type: CloudSubscriptionType.Flexible,
  name: mockCloudApiSubscription.name,
  numberOfDatabases: mockCloudApiSubscription.numberOfDatabases,
  provider: mockCloudApiSubscription.cloudDetails[0].provider,
  region: mockCloudApiSubscription.cloudDetails[0].regions[0].region,
  status: mockCloudApiSubscription.status,
});

export const mockCloudSubscriptionFixed = Object.assign(new CloudSubscription(), {
  ...mockCloudSubscription,
  type: CloudSubscriptionType.Fixed,
});

export const mockCloudApiDatabase: ICloudApiDatabase = {
  databaseId: 50859754,
  name: 'bdb',
  protocol: CloudDatabaseProtocol.Redis,
  provider: 'GCP',
  region: 'us-central1',
  redisVersionCompliance: '5.0.5',
  status: CloudDatabaseStatus.Active,
  memoryLimitInGb: 1.0,
  memoryUsedInMb: 6.0,
  memoryStorage: 'ram',
  supportOSSClusterApi: false,
  dataPersistence: 'none',
  replication: true,
  dataEvictionPolicy: 'volatile-lru',
  throughputMeasurement: {
    by: 'operations-per-second',
    value: 25000,
  },
  activatedOn: '2019-12-31T09:38:41Z',
  lastModified: '2019-12-31T09:38:41Z',
  publicEndpoint:
    'redis-14621.c34097.us-central1-mz.gcp.qa-cloud.rlrcp.com:14621',
  privateEndpoint:
    'redis-14621.internal.c34097.us-central1-mz.gcp.qa-cloud.rlrcp.com:14621',
  replicaOf: {
    endpoints: [
      'redis-19669.c9244.us-central1-mz.gcp.cloud.rlrcp.com:19669',
      'redis-14074.c9243.us-central1-mz.gcp.cloud.rlrcp.com:14074',
    ],
  },
  clustering: {
    numberOfShards: 1,
    regexRules: [],
    hashingPolicy: 'standard',
  },
  security: {
    sslClientAuthentication: false,
    sourceIps: ['0.0.0.0/0'],
  },
  modules: [
    {
      id: 1,
      name: 'ReJSON',
      version: 'v10007',
    },
  ],
  alerts: [],
};

export const mockCloudApiDatabaseFixed: ICloudApiDatabase = {
  ...mockCloudApiDatabase,
  protocol: CloudDatabaseProtocol.Stack,
  planMemoryLimit: 256,
  memoryLimitMeasurementUnit: 'MB',
};

export const mockCloudDatabase = Object.assign(new CloudDatabase(), {
  subscriptionId: mockCloudSubscription.id,
  subscriptionType: CloudSubscriptionType.Flexible,
  databaseId: mockCloudApiDatabase.databaseId,
  name: mockCloudApiDatabase.name,
  publicEndpoint: mockCloudApiDatabase.publicEndpoint,
  status: mockCloudApiDatabase.status,
  sslClientAuthentication: false,
  modules: ['ReJSON'],
  options: {
    enabledBackup: false,
    enabledClustering: false,
    enabledDataPersistence: false,
    enabledRedisFlash: false,
    enabledReplication: true,
    isReplicaDestination: true,
    persistencePolicy: 'none',
  },
  cloudDetails: {
    cloudId: mockCloudApiDatabase.databaseId,
    subscriptionType: CloudSubscriptionType.Flexible,
  },
});

export const mockCloudDatabaseFixed = Object.assign(new CloudDatabase(), {
  ...mockCloudDatabase,
  subscriptionType: CloudSubscriptionType.Fixed,
  cloudDetails: {
    cloudId: mockCloudApiDatabase.databaseId,
    subscriptionType: CloudSubscriptionType.Fixed,
    planMemoryLimit: mockCloudApiDatabaseFixed.planMemoryLimit,
    memoryLimitMeasurementUnit: mockCloudApiDatabaseFixed.memoryLimitMeasurementUnit,
  },
});

export const mockCloudDatabaseFromList = Object.assign(new CloudDatabase(), {
  ...mockCloudDatabase,
  options: {
    ...mockCloudDatabase.options,
    isReplicaSource: false,
  },
});

export const mockCloudDatabaseFromListFixed = Object.assign(new CloudDatabase(), {
  ...mockCloudDatabaseFixed,
  options: {
    ...mockCloudDatabaseFixed.options,
    isReplicaSource: false,
  },
});

export const mockCloudApiSubscriptionDatabases = {
  accountId: mockCloudAccountInfo.accountId,
  subscription: [
    {
      subscriptionId: mockCloudSubscription.id,
      numberOfDatabases: mockCloudSubscription.numberOfDatabases,
      databases: [mockCloudApiDatabase],
    },
  ],
};

export const mockCloudApiSubscriptionDatabasesFixed = {
  ...mockCloudApiSubscriptionDatabases,
  subscription: {
    ...mockCloudApiSubscriptionDatabases.subscription[0],
    databases: [mockCloudApiDatabaseFixed],
  },
};

export const mockCloudAuthDto: CloudAuthDto = {
  apiKey: 'api_key',
  apiSecret: 'api_secret_key',
};

export const mockGetCloudSubscriptionDatabasesDto = Object.assign(new GetCloudSubscriptionDatabasesDto(), {
  subscriptionId: mockCloudSubscription.id,
  subscriptionType: mockCloudSubscription.type,
});

export const mockGetCloudSubscriptionDatabasesDtoFixed = Object.assign(new GetCloudSubscriptionDatabasesDto(), {
  subscriptionId: mockCloudSubscription.id,
  subscriptionType: CloudSubscriptionType.Fixed,
});

export const mockGetCloudSubscriptionDatabaseDto = Object.assign(new GetCloudSubscriptionDatabaseDto(), {
  subscriptionId: mockCloudSubscription.id,
  subscriptionType: mockCloudSubscription.type,
  databaseId: mockCloudDatabase.databaseId,
});

export const mockGetCloudSubscriptionDatabaseDtoFixed = Object.assign(new GetCloudSubscriptionDatabaseDto(), {
  ...mockGetCloudSubscriptionDatabaseDto,
  subscriptionType: mockCloudSubscriptionFixed.type,
});

export const mockAddCloudDatabaseDto = Object.assign(new AddCloudDatabaseDto(), {
  ...mockGetCloudSubscriptionDatabaseDto,
});

export const mockAddCloudDatabaseDtoFixed = Object.assign(new AddCloudDatabaseDto(), {
  ...mockGetCloudSubscriptionDatabaseDto,
  subscriptionType: CloudSubscriptionType.Fixed,
});

export const mockAddCloudDatabaseResponse = Object.assign(new AddCloudDatabaseResponse(), {
  ...mockAddCloudDatabaseDto,
  status: ActionStatus.Success,
  message: 'Added',
  databaseDetails: mockCloudDatabase,
});

export const mockAddCloudDatabaseResponseFixed = Object.assign(new AddCloudDatabaseResponse(), {
  ...mockAddCloudDatabaseDtoFixed,
  status: ActionStatus.Success,
  message: 'Added',
  databaseDetails: mockCloudDatabaseFixed,
});

export const mockCloudAutodiscoveryAnalytics = jest.fn(() => ({
  sendGetRECloudSubsSucceedEvent: jest.fn(),
  sendGetRECloudSubsFailedEvent: jest.fn(),
  sendGetRECloudDbsSucceedEvent: jest.fn(),
  sendGetRECloudDbsFailedEvent: jest.fn(),
}));
