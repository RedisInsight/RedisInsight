import { Test, TestingModule } from '@nestjs/testing';
import * as Redis from 'ioredis';
import { when } from 'jest-when';
import {
  mockStandaloneDatabaseEntity,
  mockStandaloneRedisInfoReply,
} from 'src/__mocks__';
import { OverviewService } from 'src/modules/shared/services/instances-business/overview.service';
import { DatabaseOverview } from 'src/modules/instances/dto/database-overview.dto';

const mockClient = Object.create(Redis.prototype);
mockClient.options = {
  ...mockClient.options,
  host: 'localhost',
  port: 6379,
};
const mockCluster = Object.create(Redis.Cluster.prototype);

const mockServerInfo = {
  redis_version: '6.2.4',
  uptime_in_seconds: '1',
};
const mockReplicationInfo = {
  role: 'master',
};
const mockMemoryInfo = {
  used_memory: '1',
};
const mockStatsInfo = {
  instantaneous_ops_per_sec: '1',
  instantaneous_input_kbps: '1',
  instantaneous_output_kbps: '1',
};
const mockCpu = {
  used_cpu_sys: '1',
  used_cpu_user: '1',
};
const mockClientsInfo = {
  connected_clients: '1',
};
const mockKeyspace = {
  db0: 'keys=1,expires=0,avg_ttl=0',
  db1: 'keys=0,expires=0,avg_ttl=0',
  db2: 'keys=1,expires=0,avg_ttl=0',
};
const mockNodeInfo = {
  host: 'localhost',
  port: 6379,
  server: mockServerInfo,
  replication: mockReplicationInfo,
  stats: mockStatsInfo,
  memory: mockMemoryInfo,
  cpu: mockCpu,
  clients: mockClientsInfo,
  keyspace: mockKeyspace,
};

const databaseId = mockStandaloneDatabaseEntity.id;
export const mockDatabaseOverview: DatabaseOverview = {
  version: mockServerInfo.redis_version,
  usedMemory: 1,
  totalKeys: 2,
  totalKeysPerDb: {
    db0: 1,
  },
  connectedClients: 1,
  opsPerSecond: 1,
  networkInKbps: 1,
  networkOutKbps: 1,
  cpuUsagePercentage: null,
};

describe('OverviewService', () => {
  let service: OverviewService;
  let spyGetNodeInfo;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OverviewService],
    }).compile();

    service = await module.get(OverviewService);
    spyGetNodeInfo = jest.spyOn<any, any>(service, 'getNodeInfo');
    mockClient.send_command = jest.fn();
  });

  describe('getOverview', () => {
    describe('Standalone', () => {
      it('should return proper overview', async () => {
        when(mockClient.send_command)
          .calledWith('info')
          .mockResolvedValue(mockStandaloneRedisInfoReply);

        const result = await service.getOverview(databaseId, mockClient);

        expect(result).toEqual({
          ...mockDatabaseOverview,
          version: '6.0.5',
          connectedClients: 1,
          totalKeys: 1,
          totalKeysPerDb: undefined,
          usedMemory: 1000000,
          cpuUsagePercentage: undefined,
          opsPerSecond: undefined,
          networkInKbps: undefined,
          networkOutKbps: undefined,
        });
      });
      it('should return total 0 and empty total per db object', async () => {
        spyGetNodeInfo.mockResolvedValueOnce({
          ...mockNodeInfo,
          keyspace: {
            db0: 'keys=0,expires=0,avg_ttl=0',
          },
        });

        expect(await service.getOverview(databaseId, mockClient)).toEqual({
          ...mockDatabaseOverview,
          totalKeys: 0,
          totalKeysPerDb: undefined,
        });
      });
      it('check for cpu on second attempt', async () => {
        spyGetNodeInfo.mockResolvedValueOnce(mockNodeInfo);
        spyGetNodeInfo.mockResolvedValueOnce({
          ...mockNodeInfo,
          server: {
            ...mockNodeInfo.server,
            uptime_in_seconds: '3',
          },
          cpu: {
            ...mockNodeInfo.cpu,
            used_cpu_sys: '1.5',
            used_cpu_user: '1.5',
          },
        });

        expect(await service.getOverview(databaseId, mockClient)).toEqual({
          ...mockDatabaseOverview,
        });

        expect(await service.getOverview(databaseId, mockClient)).toEqual({
          ...mockDatabaseOverview,
          cpuUsagePercentage: 50,
        });
      });
      it('check for cpu max value = 100', async () => {
        spyGetNodeInfo.mockResolvedValueOnce(mockNodeInfo);
        spyGetNodeInfo.mockResolvedValueOnce({
          ...mockNodeInfo,
          server: {
            ...mockNodeInfo.server,
            uptime_in_seconds: '2',
          },
          cpu: {
            ...mockNodeInfo.cpu,
            used_cpu_sys: '1.51',
            used_cpu_user: '1.50002',
          },
        });

        expect(await service.getOverview(databaseId, mockClient)).toEqual({
          ...mockDatabaseOverview,
        });

        expect(await service.getOverview(databaseId, mockClient)).toEqual({
          ...mockDatabaseOverview,
          cpuUsagePercentage: 100,
        });
      });
      it('should not return cpu (undefined) when used_cpu_sys = 0', async () => {
        spyGetNodeInfo.mockResolvedValueOnce({
          ...mockNodeInfo,
          server: {
            ...mockNodeInfo.server,
            uptime_in_seconds: '2',
          },
          cpu: {
            ...mockNodeInfo.cpu,
            used_cpu_sys: '0',
            used_cpu_user: '1.50002',
          },
        });

        expect(await service.getOverview(databaseId, mockClient)).toEqual({
          ...mockDatabaseOverview,
          cpuUsagePercentage: undefined,
        });
      });
    });
    describe('Cluster', () => {
      it('Should calculate overview and ignore replica where needed', async () => {
        mockCluster.nodes = jest.fn()
          .mockReturnValue(new Array(6).fill(Promise.resolve()));

        spyGetNodeInfo.mockResolvedValueOnce({
          ...mockNodeInfo,
          port: 12001,
        });
        spyGetNodeInfo.mockResolvedValueOnce({
          ...mockNodeInfo,
          port: 12002,
        });
        spyGetNodeInfo.mockResolvedValueOnce({
          ...mockNodeInfo,
          port: 12003,
        });
        spyGetNodeInfo.mockResolvedValueOnce({
          ...mockNodeInfo,
          port: 12004,
          replication: { role: 'slave' },
        });
        spyGetNodeInfo.mockResolvedValueOnce({
          ...mockNodeInfo,
          port: 12005,
          replication: { role: 'slave' },
        });
        spyGetNodeInfo.mockResolvedValueOnce({
          ...mockNodeInfo,
          port: 12006,
          replication: { role: 'slave' },
        });

        expect(await service.getOverview(databaseId, mockCluster)).toEqual({
          ...mockDatabaseOverview,
          connectedClients: 1,
          totalKeys: 6,
          totalKeysPerDb: {
            db0: 3,
          },
          usedMemory: 3,
          networkInKbps: 6,
          networkOutKbps: 6,
          opsPerSecond: 6,
          cpuUsagePercentage: null,
        });

        spyGetNodeInfo.mockResolvedValueOnce({
          ...mockNodeInfo,
          port: 12001,
          server: { ...mockNodeInfo.server, uptime_in_seconds: '3' },
          cpu: { ...mockNodeInfo.cpu, used_cpu_sys: '1.5', used_cpu_user: '1.5' },
        });
        spyGetNodeInfo.mockResolvedValueOnce({
          ...mockNodeInfo,
          port: 12002,
          server: { ...mockNodeInfo.server, uptime_in_seconds: '3' },
          cpu: { ...mockNodeInfo.cpu, used_cpu_sys: '1.5', used_cpu_user: '1.5' },
        });
        spyGetNodeInfo.mockResolvedValueOnce({
          ...mockNodeInfo,
          port: 12003,
          server: { ...mockNodeInfo.server, uptime_in_seconds: '3' },
          cpu: { ...mockNodeInfo.cpu, used_cpu_sys: '1.5', used_cpu_user: '1.5' },
        });
        spyGetNodeInfo.mockResolvedValueOnce({
          ...mockNodeInfo,
          port: 12004,
          replication: { role: 'slave' },
          server: { ...mockNodeInfo.server, uptime_in_seconds: '3' },
          cpu: { ...mockNodeInfo.cpu, used_cpu_sys: '1.5', used_cpu_user: '1.5' },
        });
        spyGetNodeInfo.mockResolvedValueOnce({
          ...mockNodeInfo,
          port: 12005,
          replication: { role: 'slave' },
          server: { ...mockNodeInfo.server, uptime_in_seconds: '3' },
          cpu: { ...mockNodeInfo.cpu, used_cpu_sys: '1.5', used_cpu_user: '1.5' },
        });
        spyGetNodeInfo.mockResolvedValueOnce({
          ...mockNodeInfo,
          port: 12006,
          replication: { role: 'slave' },
          server: { ...mockNodeInfo.server, uptime_in_seconds: '3' },
          cpu: { ...mockNodeInfo.cpu, used_cpu_sys: '1.5', used_cpu_user: '1.5' },
        });

        expect(await service.getOverview(databaseId, mockCluster)).toEqual({
          ...mockDatabaseOverview,
          connectedClients: 1,
          totalKeys: 6,
          totalKeysPerDb: {
            db0: 3,
          },
          usedMemory: 3,
          networkInKbps: 6,
          networkOutKbps: 6,
          opsPerSecond: 6,
          cpuUsagePercentage: 300,
        });
      });
    });
  });
});
