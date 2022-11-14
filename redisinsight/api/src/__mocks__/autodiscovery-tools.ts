// import { RedisEnterpriseDatabase } from 'src/modules/redis-enterprise/dto/cluster.dto';
// import { RedisEnterpriseDatabaseStatus } from 'src/modules/redis-enterprise/models/redis-enterprise-database';
// import { GetRedisCloudSubscriptionResponse, RedisCloudDatabase } from 'src/modules/redis-enterprise/dto/cloud.dto';
// import { RedisCloudSubscriptionStatus } from 'src/modules/redis-enterprise/models/redis-cloud-subscriptions';
// import { SentinelMaster, SentinelMasterStatus } from 'src/modules/redis-sentinel/models/sentinel';
//
// export const mockAutodiscoveryAnalyticsService = () => ({
//   sendGetREClusterDbsSucceedEvent: jest.fn(),
//   sendGetREClusterDbsFailedEvent: jest.fn(),
//   sendGetRECloudSubsSucceedEvent: jest.fn(),
//   sendGetRECloudSubsFailedEvent: jest.fn(),
//   sendGetRECloudDbsSucceedEvent: jest.fn(),
//   sendGetRECloudDbsFailedEvent: jest.fn(),
//   sendGetSentinelMastersSucceedEvent: jest.fn(),
//   sendGetSentinelMastersFailedEvent: jest.fn(),
// });
//
// export const mockRedisEnterpriseDatabaseDto: RedisEnterpriseDatabase = {
//   uid: 1,
//   address: '172.17.0.2',
//   dnsName: 'redis-12000.clus.local',
//   modules: [],
//   name: 'db',
//   options: {},
//   port: 12000,
//   status: RedisEnterpriseDatabaseStatus.Active,
//   tls: false,
//   password: null,
// };
//
// export const mockRedisCloudSubscriptionDto: GetRedisCloudSubscriptionResponse = {
//   id: 1,
//   name: 'Basic subscription example',
//   numberOfDatabases: 1,
//   provider: 'AWS',
//   region: 'us-east-1',
//   status: RedisCloudSubscriptionStatus.Active,
// };
//
// export const mockRedisCloudDatabaseDto: RedisCloudDatabase = {
//   databaseId: 51166493,
//   subscriptionId: 1,
//   modules: [],
//   name: 'Database',
//   options: {},
//   publicEndpoint: 'redis.us-east-1-1.rlrcp.com:12315',
//   sslClientAuthentication: false,
//   status: RedisEnterpriseDatabaseStatus.Active,
// };
//
// export const mockSentinelMasterDto: SentinelMaster = {
//   name: 'mymaster',
//   host: '127.0.0.1',
//   port: 6379,
//   numberOfSlaves: 1,
//   status: SentinelMasterStatus.Active,
//   endpoints: [{
//     host: '127.0.0.1',
//     port: 26379,
//   }],
// };
