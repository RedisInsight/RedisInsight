import { Test, TestingModule } from '@nestjs/testing';
import Redis from 'ioredis';
import { when } from 'jest-when';
import { IRedisClusterNode, RedisClusterNodeLinkState, ReplyError } from 'src/models';
import {
  mockRedisClientsInfoResponse,
  mockRedisClusterFailInfoResponse,
  mockRedisClusterNodesResponse,
  mockRedisClusterOkInfoResponse,
  mockRedisSentinelMasterResponse,
  mockRedisServerInfoResponse,
  mockStandaloneRedisInfoReply,
} from 'src/__mocks__';
import { RedisDatabaseInfoResponse } from 'src/modules/instances/dto/redis-info.dto';
import { REDIS_MODULES_COMMANDS, RedisModules } from 'src/constants';
import { ConfigurationBusinessService } from './configuration-business.service';

const mockClient = Object.create(Redis.prototype);
const mockClusterNode1 = Object.create(Redis.prototype);
const mockClusterNode2 = Object.create(Redis.prototype);
mockClusterNode1.call = jest.fn();
mockClusterNode2.call = jest.fn();
mockClusterNode1.info = jest.fn();
mockClusterNode2.info = jest.fn();
const mockCluster = Object.create(Redis.Cluster.prototype);

const mockRedisClusterNodesDto: IRedisClusterNode[] = [
  {
    id: '07c37dfeb235213a872192d90877d0cd55635b91',
    host: '127.0.0.1',
    port: 30004,
    replicaOf: 'e7d1eecce10fd6bb5eb35b9f99a514335d9ba9ca',
    linkState: RedisClusterNodeLinkState.Connected,
    slot: undefined,
  },
  {
    id: 'e7d1eecce10fd6bb5eb35b9f99a514335d9ba9ca',
    host: '127.0.0.1',
    port: 30001,
    replicaOf: undefined,
    linkState: RedisClusterNodeLinkState.Connected,
    slot: '0-16383',
  },
];

const mockRedisServerInfoDto = {
  redis_version: '6.0.5',
  redis_mode: 'standalone',
  os: 'Linux 4.15.0-1087-gcp x86_64',
  arch_bits: '64',
  tcp_port: '11113',
  uptime_in_seconds: '1000',
};

export const mockRedisGeneralInfo: RedisDatabaseInfoResponse = {
  version: mockRedisServerInfoDto.redis_version,
  databases: 16,
  role: 'master',
  server: mockRedisServerInfoDto,
  usedMemory: 1000000,
  totalKeys: 1,
  connectedClients: 1,
  uptimeInSeconds: 1000,
  hitRatio: 1,
};

const mockRedisModuleList = [
  { name: 'ai', ver: 10000 },
  { name: 'graph', ver: 10000 },
  { name: 'rg', ver: 10000 },
  { name: 'bf', ver: 10000 },
  { name: 'ReJSON', ver: 10000 },
  { name: 'search', ver: 10000 },
  { name: 'timeseries', ver: 10000 },
  { name: 'customModule', ver: 10000 },
].map((item) => ([].concat(...Object.entries(item))));

const mockUnknownCommandModule = new Error("unknown command 'module'");

describe('ConfigurationBusinessService', () => {
  let service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigurationBusinessService],
    }).compile();

    service = await module.get<ConfigurationBusinessService>(
      ConfigurationBusinessService,
    );
    mockClient.call = jest.fn();
    mockClient.info = jest.fn();
    mockClient.cluster = jest.fn();
  });

  describe('checkClusterConnection', () => {
    it('cluster connection ok', async () => {
      when(mockClient.cluster)
        .calledWith('INFO')
        .mockResolvedValue(mockRedisClusterOkInfoResponse);

      const result = await service.checkClusterConnection(mockClient);

      expect(result).toEqual(true);
    });

    it('cluster connection ok', async () => {
      when(mockClient.cluster)
        .calledWith('INFO')
        .mockResolvedValue(mockRedisClusterFailInfoResponse);

      const result = await service.checkClusterConnection(mockClient);

      expect(result).toEqual(false);
    });
    it('cluster not supported', async () => {
      const replyError: ReplyError = {
        name: 'ReplyError',
        message: 'ERR This instance has cluster support disabled',
        command: 'CLUSTER',
      };
      when(mockClient.call)
        .calledWith('cluster', ['info'])
        .mockRejectedValue(replyError);

      const result = await service.checkClusterConnection(mockClient);

      expect(result).toEqual(false);
    });
  });

  describe('checkSentinelConnection', () => {
    it('sentinel connection ok', async () => {
      when(mockClient.call)
        .calledWith('sentinel', ['masters'])
        .mockResolvedValue(mockRedisSentinelMasterResponse);

      const result = await service.checkSentinelConnection(mockClient);

      expect(result).toEqual(true);
    });
    it('sentinel not supported', async () => {
      const replyError: ReplyError = {
        name: 'ReplyError',
        message: 'Unknown command `sentinel`',
        command: 'SENTINEL',
      };
      when(mockClient.call)
        .calledWith('sentinel', ['masters'])
        .mockRejectedValue(replyError);

      const result = await service.checkSentinelConnection(mockClient);

      expect(result).toEqual(false);
    });
  });

  describe('getRedisClusterNodes', () => {
    it('should return nodes in a defined format', async () => {
      when(mockClient.call)
        .calledWith('cluster', ['nodes'])
        .mockResolvedValue(mockRedisClusterNodesResponse);

      const result = await service.getRedisClusterNodes(mockClient);

      expect(result).toEqual(mockRedisClusterNodesDto);
    });
    it('cluster not supported', async () => {
      const replyError: ReplyError = {
        name: 'ReplyError',
        message: 'ERR This instance has cluster support disabled',
        command: 'CLUSTER',
      };
      when(mockClient.call)
        .calledWith('cluster', ['nodes'])
        .mockRejectedValue(replyError);

      try {
        await service.getRedisClusterNodes(mockClient);
        fail('Should throw an error');
      } catch (err) {
        expect(err).toEqual(replyError);
      }
    });
  });

  describe('getDatabasesCount', () => {
    it('get databases count', async () => {
      when(mockClient.call)
        .calledWith('config', ['get', 'databases'])
        .mockResolvedValue(['databases', '16']);

      const result = await service.getDatabasesCount(mockClient);

      expect(result).toBe(16);
    });
    it('get databases count for limited redis db', async () => {
      when(mockClient.call)
        .calledWith('config', ['get', 'databases'])
        .mockResolvedValue([]);

      const result = await service.getDatabasesCount(mockClient);

      expect(result).toBe(1);
    });
    it('failed to get databases config', async () => {
      when(mockClient.call)
        .calledWith('config', ['get', 'databases'])
        .mockRejectedValue(new Error("unknown command 'config'"));

      const result = await service.getDatabasesCount(mockClient);

      expect(result).toBe(1);
    });
  });

  describe('getLoadedModulesList', () => {
    it('get modules by using MODULE LIST command', async () => {
      when(mockClient.call)
        .calledWith('module', ['list'])
        .mockResolvedValue(mockRedisModuleList);

      const result = await service.getLoadedModulesList(mockClient);

      expect(mockClient.call).not.toHaveBeenCalledWith('command', expect.anything());
      expect(result).toEqual([
        { name: RedisModules.RedisAI, version: 10000, semanticVersion: '1.0.0' },
        { name: RedisModules.RedisGraph, version: 10000, semanticVersion: '1.0.0' },
        { name: RedisModules.RedisGears, version: 10000, semanticVersion: '1.0.0' },
        { name: RedisModules.RedisBloom, version: 10000, semanticVersion: '1.0.0' },
        { name: RedisModules.RedisJSON, version: 10000, semanticVersion: '1.0.0' },
        { name: RedisModules.RediSearch, version: 10000, semanticVersion: '1.0.0' },
        { name: RedisModules.RedisTimeSeries, version: 10000, semanticVersion: '1.0.0' },
        { name: 'customModule', version: 10000, semanticVersion: undefined },
      ]);
    });
    it('detect all modules by using COMMAND INFO command', async () => {
      when(mockClient.call)
        .calledWith('module', ['list'])
        .mockRejectedValue(mockUnknownCommandModule);
      when(mockClient.call)
        .calledWith('command', expect.anything())
        .mockResolvedValue([
          null,
          ['somecommand', -1, ['readonly'], 0, 0, -1, []],
        ]);

      const result = await service.getLoadedModulesList(mockClient);

      expect(mockClient.call).toHaveBeenCalledTimes(REDIS_MODULES_COMMANDS.size + 1);
      expect(result).toEqual([
        { name: RedisModules.RedisAI },
        { name: RedisModules.RedisGraph },
        { name: RedisModules.RedisGears },
        { name: RedisModules.RedisBloom },
        { name: RedisModules.RedisJSON },
        { name: RedisModules.RediSearch },
        { name: RedisModules.RedisTimeSeries },
      ]);
    });
    it('detect only RediSearch module by using COMMAND INFO command', async () => {
      when(mockClient.call)
        .calledWith('module', ['list'])
        .mockRejectedValue(mockUnknownCommandModule);
      when(mockClient.call)
        .calledWith('command', ['info', ...REDIS_MODULES_COMMANDS.get(RedisModules.RediSearch)])
        .mockResolvedValue([['FT.INFO', -1, ['readonly'], 0, 0, -1, []]]);

      const result = await service.getLoadedModulesList(mockClient);

      expect(mockClient.call).toHaveBeenCalledTimes(REDIS_MODULES_COMMANDS.size + 1);
      expect(result).toEqual([
        { name: RedisModules.RediSearch },
      ]);
    });
    it('should return empty array if MODULE LIST and COMMAND command not allowed', async () => {
      when(mockClient.call)
        .calledWith('module', ['list'])
        .mockRejectedValue(mockUnknownCommandModule);
      when(mockClient.call)
        .calledWith('command', expect.anything())
        .mockRejectedValue(mockUnknownCommandModule);

      const result = await service.getLoadedModulesList(mockClient);

      expect(result).toEqual([]);
    });
  });

  describe('getRedisGeneralInfo', () => {
    beforeEach(() => {
      service.getDatabasesCount = jest.fn().mockResolvedValue(16);
    });
    it('get general info for redis standalone', async () => {
      when(mockClient.info)
        .calledWith()
        .mockResolvedValue(mockStandaloneRedisInfoReply);

      const result = await service.getRedisGeneralInfo(mockClient);

      expect(result).toEqual(mockRedisGeneralInfo);
    });
    it('get general info for redis standalone without some optional fields', async () => {
      const reply: string = `${mockRedisServerInfoResponse
      }\r\n${
        mockRedisClientsInfoResponse
      }\r\n`;
      when(mockClient.info).calledWith().mockResolvedValue(reply);

      const result = await service.getRedisGeneralInfo(mockClient);

      expect(result).toEqual({
        ...mockRedisGeneralInfo,
        totalKeys: undefined,
        usedMemory: undefined,
        hitRatio: undefined,
        role: undefined,
      });
    });
    it('get general info for redis cluster', async () => {
      mockCluster.nodes = jest
        .fn()
        .mockReturnValue([mockClusterNode1, mockClusterNode2]);
      when(mockClusterNode1.info)
        .calledWith()
        .mockResolvedValue(mockStandaloneRedisInfoReply);
      when(mockClusterNode2.info)
        .calledWith()
        .mockResolvedValue(mockStandaloneRedisInfoReply);

      const result = await service.getRedisGeneralInfo(mockCluster);

      expect(result).toEqual({
        version: mockRedisGeneralInfo.version,
        totalKeys: mockRedisGeneralInfo.totalKeys * 2,
        usedMemory: mockRedisGeneralInfo.usedMemory * 2,
        nodes: [mockRedisGeneralInfo, mockRedisGeneralInfo],
      });
    });
  });
});
