import { RedisEnterpriseDatabaseStatus } from 'src/modules/redis-enterprise/models/redis-enterprise-database';

export interface IRedisCloudDatabasesResponse {
  accountId: number;
  subscription: {
    subscriptionId: number;
    numberOfDatabases: number;
    databases: IRedisCloudDatabase[];
  }[];
}

export interface IRedisCloudDatabase {
  databaseId: number;
  name: string;
  protocol: RedisCloudDatabaseProtocol;
  provider: string;
  region: string;
  redisVersionCompliance: string;
  status: RedisEnterpriseDatabaseStatus;
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
  clustering: IRedisCloudDatabaseClustering;
  security: IRedisCloudDatabaseSecurity;
  modules: IRedisCloudDatabaseModule[];
  alerts: IRedisCloudAlert[];
}

export enum RedisCloudDatabaseProtocol {
  Redis = 'redis',
  Memcached = 'memcached',
}

export enum RedisCloudMemoryStorage {
  Ram = 'ram',
  RamAndFlash = 'ram-and-flash',
}

export enum RedisPersistencePolicy {
  AofEveryOneSecond = 'aof-every-1-second',
  AofEveryWrite = 'aof-every-write',
  SnapshotEveryOneHour = 'snapshot-every-1-hour',
  SnapshotEverySixHours = 'snapshot-every-6-hours',
  SnapshotEveryTwelveHours = 'snapshot-every-12-hours',
  None = 'none',
}

export interface IRedisCloudDatabaseModule {
  id: number;
  name: string;
  version: string;
  description?: string;
  parameters?: any[];
}

interface IRedisCloudDatabaseSecurity {
  password?: string;
  sslClientAuthentication: boolean;
  sourceIps: string[];
}

interface IRedisCloudDatabaseClustering {
  numberOfShards: number;
  regexRules: any[];
  hashingPolicy: string;
}

interface IRedisCloudAlert {
  name: string;
  value: number;
}
