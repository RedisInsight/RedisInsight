import { RedisEnterpriseDatabase } from 'src/modules/redis-enterprise/dto/cluster.dto';
import { RedisEnterpriseDatabaseStatus } from 'src/modules/redis-enterprise/models/redis-enterprise-database';

export const mockRedisEnterpriseDatabaseDto: RedisEnterpriseDatabase = {
  uid: 1,
  address: '172.17.0.2',
  dnsName: 'redis-12000.clus.local',
  modules: [],
  name: 'db',
  options: {},
  port: 12000,
  status: RedisEnterpriseDatabaseStatus.Active,
  tls: false,
  password: null,
};

export const mockRedisEnterpriseAnalytics = jest.fn(() => ({
  sendGetREClusterDbsSucceedEvent: jest.fn(),
  sendGetREClusterDbsFailedEvent: jest.fn(),
}));
