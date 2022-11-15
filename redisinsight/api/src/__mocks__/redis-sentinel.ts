import { SentinelMaster, SentinelMasterStatus } from 'src/modules/redis-sentinel/models/sentinel-master';

export const mockSentinelMasterDto: SentinelMaster = {
  name: 'mymaster',
  host: '127.0.0.1',
  port: 6379,
  numberOfSlaves: 1,
  status: SentinelMasterStatus.Active,
  nodes: [{
    host: '127.0.0.1',
    port: 26379,
  }],
};

export const mockRedisSentinelAnalytics = jest.fn(() => ({
  sendGetSentinelMastersSucceedEvent: jest.fn(),
  sendGetSentinelMastersFailedEvent: jest.fn(),
}));
