import { CloudDatabaseProtocol, CloudDatabaseStatus } from 'src/modules/cloud/autodiscovery/models/cloud-database';
import { CloudSubscriptionStatus } from 'src/modules/cloud/autodiscovery/models/cloud-subscription';

// common interfaces
interface ICloudApiAlert {
  name: string;
  value: number;
}

// Database interfaces
interface ICloudApiDatabaseClustering {
  numberOfShards: number;
  regexRules: any[];
  hashingPolicy: string;
}

export interface ICloudApiDatabaseModule {
  id: number;
  name: string;
  version: string;
  description?: string;
  parameters?: any[];
}

interface ICloudApiDatabaseSecurity {
  password?: string;
  sslClientAuthentication: boolean;
  sourceIps: string[];
}

export interface ICloudApiDatabase {
  databaseId: number;
  name: string;
  protocol: CloudDatabaseProtocol;
  provider: string;
  region: string;
  redisVersionCompliance: string;
  status: CloudDatabaseStatus;
  memoryLimitInGb: number;
  memoryUsedInMb: number;
  memoryStorage: string;
  supportOSSClusterApi: boolean;
  dataPersistence: string;
  replication: boolean;
  periodicBackupPath?: string;
  dataEvictionPolicy: string;
  throughputMeasurement: {
    by: string;
    value: number;
  };
  activatedOn: string;
  lastModified: string;
  publicEndpoint: string;
  privateEndpoint: string;
  replicaOf: {
    endpoints: string[];
  };
  clustering: ICloudApiDatabaseClustering;
  security: ICloudApiDatabaseSecurity;
  modules: ICloudApiDatabaseModule[];
  alerts: ICloudApiAlert[];
}

export interface ICloudApiSubscriptionDatabasesSubscription {
  subscriptionId: number;
  numberOfDatabases: number;
  databases: ICloudApiDatabase[];
}

export interface ICloudApiSubscriptionDatabases {
  accountId: number;
  subscription: ICloudApiSubscriptionDatabasesSubscription | ICloudApiSubscriptionDatabasesSubscription[];
}

// Account interfaces
export interface ICloudApiAccountOwner {
  name: string;
  email: string;
}

interface ICloudApiAccountKey {
  name: string;
  accountId: number;
  accountName: string;
  allowedSourceIps: string[];
  createdTimestamp: string;
  owner: ICloudApiAccountOwner;
  httpSourceIp: string;
}

export interface ICloudApiAccount {
  id: number;
  name: string;
  createdTimestamp: string;
  updatedTimestamp: string;
  key: ICloudApiAccountKey;
}

// Subscription interfaces
interface ICloudApiSubscriptionPricing {
  type: string;
  typeDetails?: string;
  quantity: number;
  quantityMeasurement: string;
  pricePerUnit?: number;
  priceCurrency?: string;
  pricePeriod?: string;
}

interface ICloudApiSubscriptionRegion {
  region: string;
  networking: any[];
  preferredAvailabilityZones: string[];
  multipleAvailabilityZones: boolean;
}

interface ICloudApiSubscriptionDetails {
  provider: string;
  cloudAccountId: number;
  totalSizeInGb: number;
  regions: ICloudApiSubscriptionRegion[];
}

export interface ICloudApiSubscription {
  id: number;
  name: string;
  status: CloudSubscriptionStatus;
  paymentMethodId: number;
  memoryStorage: string;
  storageEncryption: boolean;
  numberOfDatabases: number;
  subscriptionPricing: ICloudApiSubscriptionPricing[];
  cloudDetails: ICloudApiSubscriptionDetails[];
}

export interface ICloudApiSubscriptions {
  accountId: number;
  subscriptions: ICloudApiSubscription[];
}
