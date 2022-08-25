import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import { set } from 'lodash';
import IORedis from 'ioredis';
import { ClusterNodesInfoStrategy } from 'src/modules/cluster-monitor/strategies/cluster-nodes.info.strategy';
import { ClusterDetails, ClusterNodeDetails } from 'src/modules/cluster-monitor/models';
import { mockStandaloneRedisInfoReply } from 'src/__mocks__';

const m1 = {
  id: 'm1',
  health: 'online',
  host: '172.30.100.1',
  primary: undefined,
  port: 6379,
  role: 'primary',
  slots: ['0-5000'],
};
const m2 = {
  id: 'm2',
  health: 'online',
  host: '172.30.100.4',
  primary: undefined,
  port: 6379,
  role: 'primary',
  slots: ['5001-10921', '10922'],
};
const m3 = {
  id: 'm3',
  health: 'online',
  host: '172.30.100.7',
  primary: undefined,
  port: 6379,
  role: 'primary',
  slots: ['10923-16383'],
};

const node1 = Object.create(IORedis.prototype);
node1.sendCommand = jest.fn();
set(node1, 'serverInfo', {
  redis_version: '7.0.2',
  redis_mode: 'cluster',
});
set(node1, 'options', {
  host: m1.host,
  port: m1.port,
});

const node2 = Object.create(IORedis.prototype);
node2.sendCommand = jest.fn();
set(node2, 'options', {
  host: m2.host,
  port: m2.port,
});

const clusterClient = Object.create(IORedis.Cluster.prototype);
clusterClient.sendCommand = jest.fn();
clusterClient.nodes = jest.fn().mockReturnValue([node1, node2]);

const mockClusterInfo: Partial<ClusterDetails> = {
  state: 'ok',
  slotsAssigned: 16374,
  slotsOk: 16360,
  slotsPFail: 10,
  slotsFail: 4,
  slotsUnassigned: 10,
  statsMessagesSent: 1000,
  statsMessagesReceived: 999,
  knownNodes: 9,
  size: 3,
  myEpoch: 2,
  currentEpoch: 6,
};

const baseNodeDetails: Partial<ClusterNodeDetails> = {
  cacheHitRatio: 1,
  connectedClients: 1,
  replicas: [],
  replicationOffset: 0,
  totalKeys: 1,
  uptimeSec: 1000,
  usedMemory: 1000000,
};

const mockNode1Details = {
  ...baseNodeDetails,
  ...m1,
} as ClusterNodeDetails;

const mockNode2Details = {
  ...baseNodeDetails,
  ...m2,
} as ClusterNodeDetails;

const mockClusterDetails: Partial<ClusterDetails> = {
  ...mockClusterInfo,
  version: '7.0.2',
  mode: 'cluster',
  uptimeSec: 1000,
  nodes: [mockNode1Details, mockNode2Details],
};

const mockClusterInfoReply = ''
  + `cluster_state:${mockClusterInfo.state}\r\n`
  + `cluster_slots_assigned:${mockClusterInfo.slotsAssigned}\r\n`
  + `cluster_slots_ok:${mockClusterInfo.slotsOk}\r\n`
  + `cluster_slots_pfail:${mockClusterInfo.slotsPFail}\r\n`
  + `cluster_slots_fail:${mockClusterInfo.slotsFail}\r\n`
  + `cluster_stats_messages_sent:${mockClusterInfo.statsMessagesSent}\r\n`
  + `cluster_stats_messages_received:${mockClusterInfo.statsMessagesReceived}\r\n`
  + `cluster_known_nodes:${mockClusterInfo.knownNodes}\r\n`
  + `cluster_size:${mockClusterInfo.size}\r\n`
  + `cluster_current_epoch:${mockClusterInfo.currentEpoch}\r\n`
  + `cluster_my_epoch:${mockClusterInfo.myEpoch}\r\n`;

describe('AbstractInfoStrategy', () => {
  let service: ClusterNodesInfoStrategy;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClusterNodesInfoStrategy,
      ],
    }).compile();

    service = module.get(ClusterNodesInfoStrategy);
    service['getClusterNodesFromRedis'] = jest.fn().mockResolvedValue([m1, m2, m3]);
  });

  describe('getClusterInfo', () => {
    beforeEach(() => {
      when(clusterClient.sendCommand)
        .mockResolvedValue(mockClusterInfoReply);
    });
    it('should return cluster info', async () => {
      const info = await ClusterNodesInfoStrategy.getClusterInfo(clusterClient);
      expect(info).toEqual(mockClusterInfo);
    });
  });

  describe('getClusterDetails', () => {
    beforeEach(() => {
      clusterClient.sendCommand.mockResolvedValue(mockClusterInfoReply);
      node1.sendCommand.mockResolvedValue(mockStandaloneRedisInfoReply);
      node2.sendCommand.mockResolvedValue(mockStandaloneRedisInfoReply);
    });
    it('should return cluster info', async () => {
      const info = await service.getClusterDetails(clusterClient);
      expect(info).toEqual(mockClusterDetails);
    });
  });
});
