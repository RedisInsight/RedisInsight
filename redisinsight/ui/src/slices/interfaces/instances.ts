import { Nullable } from 'uiSrc/utils'
import { GetHashFieldsResponse } from 'apiSrc/modules/browser/dto/hash.dto'
import { GetSetMembersResponse } from 'apiSrc/modules/browser/dto/set.dto'
import { GetRejsonRlResponseDto } from 'apiSrc/modules/browser/dto/rejson-rl.dto'
import {
  GetListElementsDto,
  GetListElementsResponse,
} from 'apiSrc/modules/browser/dto/list.dto'
import {
  DatabaseInstanceResponse,
  RedisModuleDto,
  SentinelMasterDto
} from 'apiSrc/modules/instances/dto/database-instance.dto'
import { SearchZSetMembersResponse } from 'apiSrc/modules/browser/dto'
import { AddSentinelMasterDto, AddSentinelMasterResponse } from 'apiSrc/modules/instances/dto/redis-sentinel.dto'

export interface Instance extends DatabaseInstanceResponse {
  host: string;
  port: number;
  nameFromProvider?: Nullable<string>;
  provider?: string;
  id: string;
  endpoints?: Nullable<Endpoints[]>;
  connectionType?: ConnectionType;
  lastConnection?: Date;
  password?: Nullable<string>;
  username?: Nullable<string>;
  name?: string;
  tls?: TlsSettings;
  tlsClientAuthRequired?: boolean;
  tlsClientCertId?: number | undefined;
  verifyServerCert?: boolean;
  caCertName?: string;
  authUsername?: Nullable<string>;
  authPass?: Nullable<string>;
  isDeleting?: boolean;
  sentinelMaster?: SentinelMasterDto;
  modules: RedisModuleDto[];
}

export enum ConnectionType {
  Standalone = 'STANDALONE',
  Cluster = 'CLUSTER',
  Sentinel = 'SENTINEL',
}

export const CONNECTION_TYPE_DISPLAY = Object.freeze({
  [ConnectionType.Standalone]: 'Standalone',
  [ConnectionType.Cluster]: 'OSS Cluster',
  [ConnectionType.Sentinel]: 'Sentinel',
})

export interface Endpoints {
  host: string;
  port: number;
}

export interface InstanceRedisCluster {
  host: string;
  port: number;
  uid: number;
  name: string;
  id?: number;
  dnsName: string;
  address: string;
  status: InstanceRedisClusterStatus;
  modules: RedisDefaultModules[];
  tls: boolean;
  options: any;
  message?: string;
  uidAdded?: number;
  statusAdded?: AddRedisDatabaseStatus;
  messageAdded?: string;
  databaseDetails?: InstanceRedisCluster;
}

export interface InstanceRedisCloud {
  accessKey: string;
  secretKey: string;
  credentials: Nullable<ICredentialsRedisCluster>;
  account: Nullable<RedisCloudAccount>;
  host: string;
  port: number;
  uid: number;
  name: string;
  id?: number;
  dnsName: string;
  address: string;
  status: InstanceRedisClusterStatus;
  modules: RedisDefaultModules[];
  tls: boolean;
  options: any;
  message?: string;
  publicEndpoint?: string;
  databaseId: number;
  databaseIdAdded?: number;
  subscriptionId?: number;
  subscriptionName: string;
  subscriptionIdAdded?: number;
  statusAdded?: AddRedisDatabaseStatus;
  messageAdded?: string;
  databaseDetails?: InstanceRedisCluster;
}

export interface IBulkOperationResult {
  status: AddRedisDatabaseStatus,
  message: string,
  error?: any,
}

export enum AddRedisDatabaseStatus {
  Success = 'success',
  Fail = 'fail',
}

export enum RedisDefaultModules {
  AI = 'ai',
  Graph = 'graph',
  Gears = 'rg',
  Bloom = 'bf',
  ReJSON = 'ReJSON',
  Search = 'search',
  TimeSeries = 'timeseries',
}

export enum RedisCustomModulesName {
  Proto = 'PB',
  IpTables = 'iptables-input-filter',
}

// Enums don't allow to use dynamic key
export const DATABASE_LIST_MODULES_TEXT = Object.freeze({
  [RedisDefaultModules.AI]: 'RedisAI',
  [RedisDefaultModules.Graph]: 'RedisGraph',
  [RedisDefaultModules.Gears]: 'RedisGears',
  [RedisDefaultModules.Bloom]: 'RedisBloom',
  [RedisDefaultModules.ReJSON]: 'RedisJSON',
  [RedisDefaultModules.Search]: 'RediSearch',
  [RedisDefaultModules.TimeSeries]: 'RedisTimeSeries',
  [RedisCustomModulesName.Proto]: 'redis-protobuf',
  [RedisCustomModulesName.IpTables]: 'RedisPushIpTables'
})

export enum AddRedisClusterDatabaseOptions {
  ActiveActive = 'enabledActiveActive',
  Backup = 'enabledBackup',
  Clustering = 'enabledClustering',
  PersistencePolicy = 'persistencePolicy',
  Flash = 'enabledRedisFlash',
  Replication = 'enabledReplication',
  ReplicaDestination = 'isReplicaDestination',
  ReplicaSource = 'isReplicaSource',
}

// Enums don't allow to use dynamic key
export const DATABASE_LIST_OPTIONS_TEXT = Object.freeze({
  [AddRedisClusterDatabaseOptions.ActiveActive]: 'Active-Active',
  [AddRedisClusterDatabaseOptions.Backup]: 'Backup',
  [AddRedisClusterDatabaseOptions.Clustering]: 'Clustering',
  [AddRedisClusterDatabaseOptions.PersistencePolicy]: 'Persistence',
  [AddRedisClusterDatabaseOptions.Flash]: 'Flash',
  [AddRedisClusterDatabaseOptions.Replication]: 'Replication',
  [AddRedisClusterDatabaseOptions.ReplicaDestination]: 'Replica Destination',
  [AddRedisClusterDatabaseOptions.ReplicaSource]: 'Replica Source',
})

export enum PersistencePolicy {
  'none' = 'none',
  'aof-every-1-second' = 'Append-only file (AOF) every 1 second',
  'aof-every-write' = 'Append-only file (AOF) every write',
  'snapshot-every-1-hour' = 'Redis database backup (RDB) every 1 hour',
  'snapshot-every-6-hours' = 'Redis database backup (RDB) every 6 hours',
  'snapshot-every-12-hours' = 'Redis database backup (RDB) every 12 hours',
}

export enum InstanceRedisClusterStatus {
  Pending = 'pending',
  CreationFailed = 'creation-failed',
  Active = 'active',
  ActiveChangePending = 'active-change-pending',
  ImportPending = 'import-pending',
  DeletePending = 'delete-pending',
  Recovery = 'recovery',
}

export interface TlsSettings {
  caCertId?: string;
  clientCertPairId?: string;
  verifyServerCert?: boolean;
}

export interface ClusterNode {
  host: string;
  port: number;
  role?: 'slave' | 'master';
  slot?: number;
}

export enum RedisCloudSubscriptionStatus {
  Active = 'active',
  NotActivated = 'not_activated',
  Deleting = 'deleting',
  Pending = 'pending',
  Error = 'error',
}

export const RedisCloudSubscriptionStatusText = Object.freeze({
  [RedisCloudSubscriptionStatus.Active]: 'Active',
  [RedisCloudSubscriptionStatus.NotActivated]: 'Not Activated',
  [RedisCloudSubscriptionStatus.Deleting]: 'Deleting',
  [RedisCloudSubscriptionStatus.Pending]: 'Pending',
  [RedisCloudSubscriptionStatus.Error]: 'Error',
})

export interface RedisCloudSubscription {
  id: number;
  name: string;
  numberOfDatabases: number;
  provider: string;
  region: string;
  status: RedisCloudSubscriptionStatus;
}

export interface DatabaseConfigInfo {
  version: string;
  totalKeys?: Nullable<number>;
  usedMemory?: Nullable<number>;
  connectedClients?: Nullable<number>;
  opsPerSecond?: Nullable<number>;
  networkInKbps?: Nullable<number>;
  networkOutKbps?: Nullable<number>;
  cpuUsagePercentage?: Nullable<number>;
}

export interface InitialStateInstances {
  loading: boolean;
  error: string;
  data: Instance[];
  loadingChanging: boolean;
  errorChanging: string;
  changedSuccessfully: boolean;
  deletedSuccessfully: boolean;
  connectedInstance: Instance;
  instanceOverview: DatabaseConfigInfo;
}

export interface InitialStateCluster {
  loading: boolean;
  data: Nullable<InstanceRedisCluster[]>;
  dataAdded: InstanceRedisCluster[];
  error: string;
  credentials: Nullable<ICredentialsRedisCluster>;
}

export interface InitialStateCloud {
  loading: boolean;
  data: Nullable<InstanceRedisCloud[]>;
  dataAdded: InstanceRedisCloud[];
  error: string;
  credentials: Nullable<ICredentialsRedisCloud>;
  subscriptions: Nullable<RedisCloudSubscription[]>;
  account: {
    data: Nullable<RedisCloudAccount>;
    error: string;
  };
  loaded: ILoadedCloud;
}

export interface InitialStateSentinel {
  loading: boolean;
  instance: Nullable<Instance>;
  data: ModifiedSentinelMaster[];
  statuses: AddSentinelMasterResponse[];
  error: string;
  loaded: ILoadedSentinel;
}

export enum LoadedCloud {
  Subscriptions = 'subscriptions',
  Instances = 'instances',
  InstancesAdded = 'instancesAdded',
}

export enum LoadedSentinel {
  Masters = 'masters',
  MastersAdded = 'mastersAdded',
}

export interface ILoadedCloud {
  [LoadedCloud.Subscriptions]?: boolean;
  [LoadedCloud.Instances]?: boolean;
  [LoadedCloud.InstancesAdded]?: boolean;
}

export interface ILoadedSentinel {
  [LoadedSentinel.Masters]?: boolean;
  [LoadedSentinel.MastersAdded]?: boolean;
}

export interface ModifiedGetSetMembersResponse extends GetSetMembersResponse {
  key?: string;
  match?: string;
}

export interface ModifiedZsetMembersResponse extends SearchZSetMembersResponse {
  key?: string;
  match?: string;
}

export interface ModifiedGetHashMembersResponse extends GetHashFieldsResponse {
  key?: string;
  match?: string;
}

export interface ModifiedSentinelMaster extends AddSentinelMasterDto {
  id?: string;
  alias?: string;
  host?: string;
  port?: string;
  username?: string;
  password?: string;
  loading?: boolean;
  message?: string;
  status?: AddRedisDatabaseStatus;
  error?: string | object;
}

export interface ModifiedGetListElementsResponse
  extends GetListElementsDto,
  GetListElementsResponse {
  key?: string;
  searchedIndex: Nullable<number>;
}

export interface InitialStateSet {
  loading: boolean;
  error: string;
  data: ModifiedGetSetMembersResponse;
}

export interface InitialStateRejson {
  loading: boolean;
  error: string;
  data: GetRejsonRlResponseDto;
}

export interface ICredentialsRedisCluster {
  host: string;
  port: number;
  username: string;
  password: string;
}

export interface RedisCloudAccount {
  accountId: Nullable<number>;
  accountName: Nullable<string>;
  ownerEmail: Nullable<string>;
  ownerName: Nullable<string>;
}

export interface ICredentialsRedisCloud {
  accessKey: Nullable<string>;
  secretKey: Nullable<string>;
}

export enum InstanceType {
  Standalone = 'Redis Database',
  RedisCloudPro = 'Redis Enterprise Cloud',
  RedisEnterpriseCluster = 'Redis Enterprise Cluster',
  AWSElasticache = 'AWS Elasticache',
  Sentinel = 'Redis Sentinel',
}
