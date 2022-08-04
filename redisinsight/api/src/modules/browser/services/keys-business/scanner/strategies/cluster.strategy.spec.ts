import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import {
  mockRedisClusterConsumer,
  mockRedisNoPermError,
  mockSettingsJSON,
  mockSettingsProvider,
  mockStandaloneDatabaseEntity,
} from 'src/__mocks__';
import { ReplyError } from 'src/models';
import config from 'src/utils/config';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { GetKeysDto, RedisDataType } from 'src/modules/browser/dto';
import {
  BrowserToolClusterService,
} from 'src/modules/browser/services/browser-tool-cluster/browser-tool-cluster.service';
import { BrowserToolKeysCommands } from 'src/modules/browser/constants/browser-tool-commands';
import { IFindRedisClientInstanceByOptions } from 'src/modules/core/services/redis/redis.service';
import { IGetNodeKeysResult } from 'src/modules/browser/services/keys-business/scanner/scanner.interface';
import { ISettingsProvider } from 'src/modules/core/models/settings-provider.interface';
import * as Redis from 'ioredis';
import { ClusterStrategy } from './cluster.strategy';

const REDIS_SCAN_CONFIG = config.get('redis_scan');
const mockClientOptions: IFindRedisClientInstanceByOptions = {
  instanceId: mockStandaloneDatabaseEntity.id,
};

const nodeClient = Object.create(Redis.prototype);
nodeClient.sendCommand = jest.fn();

const mockClusterNode1 = nodeClient;
const mockClusterNode2 = nodeClient;
const clusterClient = Object.create(Redis.Cluster.prototype);
clusterClient.sendCommand = jest.fn();
mockClusterNode1.options = { ...nodeClient.options, host: 'localhost', port: 5000 };
mockClusterNode2.options = { ...nodeClient.options, host: 'localhost', port: 5001 };

const getKeyInfoResponse = {
  name: 'testString',
  type: 'string',
  ttl: -1,
  size: 50,
};
const mockNodeEmptyResult: IGetNodeKeysResult = {
  total: 0,
  scanned: 0,
  cursor: 0,
  keys: [],
};
const mockClusterNodes = [
  { host: '172.1.0.1', port: 7000 },
  { host: '172.1.0.1', port: 7001 },
  { host: '172.1.0.1', port: 7002 },
];
const mockGetClusterNodes = [
  { options: { ...mockClusterNodes[0] } },
  { options: { ...mockClusterNodes[1] } },
  { options: { ...mockClusterNodes[2] } },
];
const mockClusterNodesEmptyResult: IGetNodeKeysResult[] = [
  { ...mockNodeEmptyResult, ...mockClusterNodes[0] },
  { ...mockNodeEmptyResult, ...mockClusterNodes[1] },
  { ...mockNodeEmptyResult, ...mockClusterNodes[2] },
];

const mockGetKeysInfoFn = jest.fn();
mockGetKeysInfoFn.mockImplementation(async (clientOptions, keys) => {
  if (keys.length < 1) {
    return [];
  }
  return new Array(keys.length).fill(getKeyInfoResponse);
});

let strategy;
let browserTool;
let settingsProvider;

describe('Cluster Scanner Strategy', () => {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: BrowserToolClusterService,
          useFactory: mockRedisClusterConsumer,
        },
        {
          provide: 'SETTINGS_PROVIDER',
          useFactory: mockSettingsProvider,
        },
      ],
    }).compile();

    browserTool = module.get<BrowserToolClusterService>(
      BrowserToolClusterService,
    );
    settingsProvider = module.get<ISettingsProvider>('SETTINGS_PROVIDER');
    settingsProvider.getSettings = jest.fn().mockResolvedValue({
      ...mockSettingsJSON,
      scanThreshold: REDIS_SCAN_CONFIG.countThreshold,
    });
    strategy = new ClusterStrategy(browserTool, settingsProvider);
    browserTool.getRedisClient.mockResolvedValue(clusterClient);
    mockGetKeysInfoFn.mockClear();
  });

  describe('getKeys', () => {
    beforeEach(() => {
      browserTool.getNodes = jest.fn().mockResolvedValue(mockGetClusterNodes);
    });
    const getKeysDto: GetKeysDto = { cursor: '0', count: 15 };
    it('should return appropriate value with filter by type', async () => {
      const args = { ...getKeysDto, type: 'string', match: 'pattern*' };
      when(browserTool.execCommandFromNode)
        .calledWith(
          mockClientOptions,
          BrowserToolKeysCommands.Scan,
          expect.anything(),
          expect.anything(),
          null,
        )
        .mockResolvedValue({ result: [0, [Buffer.from(getKeyInfoResponse.name)]] });
      when(browserTool.execCommandFromNode)
        .calledWith(
          mockClientOptions,
          BrowserToolKeysCommands.DbSize,
          [],
          expect.anything(),
        )
        .mockResolvedValue({ result: 1 });

      strategy.getKeysInfo = jest.fn().mockResolvedValue([getKeyInfoResponse]);

      const result = await strategy.getKeys(mockClientOptions, args);

      expect(result).toEqual([
        {
          ...mockClusterNodesEmptyResult[0],
          total: 1,
          scanned: getKeysDto.count,
          keys: [getKeyInfoResponse],
        },
        {
          ...mockClusterNodesEmptyResult[1],
          total: 1,
          scanned: getKeysDto.count,
          keys: [getKeyInfoResponse],
        },
        {
          ...mockClusterNodesEmptyResult[2],
          total: 1,
          scanned: getKeysDto.count,
          keys: [getKeyInfoResponse],
        },
      ]);
      expect(strategy.getKeysInfo).toHaveBeenCalled();
      expect(browserTool.execCommandFromNode).toBeCalledTimes(6);
      expect(browserTool.execCommandFromNode).toHaveBeenNthCalledWith(
        1,
        mockClientOptions,
        BrowserToolKeysCommands.DbSize,
        [],
        mockClusterNodes[0],
      );
      expect(browserTool.execCommandFromNode).toHaveBeenNthCalledWith(
        2,
        mockClientOptions,
        BrowserToolKeysCommands.DbSize,
        [],
        mockClusterNodes[1],
      );
      expect(browserTool.execCommandFromNode).toHaveBeenNthCalledWith(
        3,
        mockClientOptions,
        BrowserToolKeysCommands.DbSize,
        [],
        mockClusterNodes[2],
      );
      expect(browserTool.execCommandFromNode).toHaveBeenNthCalledWith(
        4,
        mockClientOptions,
        BrowserToolKeysCommands.Scan,
        ['0', 'MATCH', args.match, 'COUNT', args.count, 'TYPE', args.type],
        mockClusterNodes[0],
        null,
      );
      expect(browserTool.execCommandFromNode).toHaveBeenNthCalledWith(
        5,
        mockClientOptions,
        BrowserToolKeysCommands.Scan,
        ['0', 'MATCH', args.match, 'COUNT', args.count, 'TYPE', args.type],
        mockClusterNodes[1],
        null,
      );
      expect(browserTool.execCommandFromNode).toHaveBeenNthCalledWith(
        6,
        mockClientOptions,
        BrowserToolKeysCommands.Scan,
        ['0', 'MATCH', args.match, 'COUNT', args.count, 'TYPE', args.type],
        mockClusterNodes[2],
        null,
      );
    });
    it('should call scan 3,2,1 times per nodes and return appropriate value', async () => {
      const args = { ...getKeysDto };
      when(browserTool.execCommandFromNode)
        .calledWith(
          mockClientOptions,
          BrowserToolKeysCommands.DbSize,
          [],
          mockClusterNodes[0],
        )
        .mockResolvedValue({ result: 3000 });
      when(browserTool.execCommandFromNode)
        .calledWith(
          mockClientOptions,
          BrowserToolKeysCommands.Scan,
          ['0', 'MATCH', '*', 'COUNT', args.count],
          mockClusterNodes[0],
          null,
        )
        .mockResolvedValue({ result: ['1', [Buffer.from(getKeyInfoResponse.name)]] });
      when(browserTool.execCommandFromNode)
        .calledWith(
          mockClientOptions,
          BrowserToolKeysCommands.Scan,
          ['1', 'MATCH', '*', 'COUNT', args.count],
          mockClusterNodes[0],
          null,
        )
        .mockResolvedValue({ result: ['2', [Buffer.from(getKeyInfoResponse.name)]] });
      when(browserTool.execCommandFromNode)
        .calledWith(
          mockClientOptions,
          BrowserToolKeysCommands.Scan,
          ['2', 'MATCH', '*', 'COUNT', args.count],
          mockClusterNodes[0],
          null,
        )
        .mockResolvedValue({ result: ['0', [Buffer.from(getKeyInfoResponse.name)]] });
      when(browserTool.execCommandFromNode)
        .calledWith(
          mockClientOptions,
          BrowserToolKeysCommands.DbSize,
          [],
          mockClusterNodes[1],
        )
        .mockResolvedValue({ result: 2000 });
      when(browserTool.execCommandFromNode)
        .calledWith(
          mockClientOptions,
          BrowserToolKeysCommands.Scan,
          ['0', 'MATCH', '*', 'COUNT', args.count],
          mockClusterNodes[1],
          null,
        )
        .mockResolvedValue({ result: ['1', [Buffer.from(getKeyInfoResponse.name)]] });
      when(browserTool.execCommandFromNode)
        .calledWith(
          mockClientOptions,
          BrowserToolKeysCommands.Scan,
          ['1', 'MATCH', '*', 'COUNT', args.count],
          mockClusterNodes[1],
          null,
        )
        .mockResolvedValue({ result: ['0', [Buffer.from(getKeyInfoResponse.name)]] });
      when(browserTool.execCommandFromNode)
        .calledWith(
          mockClientOptions,
          BrowserToolKeysCommands.DbSize,
          [],
          mockClusterNodes[2],
        )
        .mockResolvedValue({ result: 1000 });
      when(browserTool.execCommandFromNode)
        .calledWith(
          mockClientOptions,
          BrowserToolKeysCommands.Scan,
          expect.anything(),
          mockClusterNodes[2],
          null,
        )
        .mockResolvedValue({ result: ['0', [Buffer.from(getKeyInfoResponse.name)]] });

      strategy.getKeysInfo = mockGetKeysInfoFn;

      const result = await strategy.getKeys(mockClientOptions, args);

      expect(result).toEqual([
        {
          ...mockClusterNodesEmptyResult[0],
          total: 3000,
          scanned: getKeysDto.count * 3,
          keys: new Array(3).fill(getKeyInfoResponse),
        },
        {
          ...mockClusterNodesEmptyResult[1],
          total: 2000,
          scanned: getKeysDto.count * 2,
          keys: new Array(2).fill(getKeyInfoResponse),
        },
        {
          ...mockClusterNodesEmptyResult[2],
          total: 1000,
          scanned: getKeysDto.count,
          keys: [getKeyInfoResponse],
        },
      ]);
      expect(strategy.getKeysInfo).toHaveBeenCalled();
      expect(browserTool.execCommandFromNode).toBeCalledTimes(9);
      expect(browserTool.execCommandFromNode).toHaveBeenNthCalledWith(
        1,
        mockClientOptions,
        BrowserToolKeysCommands.DbSize,
        [],
        mockClusterNodes[0],
      );
      expect(browserTool.execCommandFromNode).toHaveBeenNthCalledWith(
        2,
        mockClientOptions,
        BrowserToolKeysCommands.DbSize,
        [],
        mockClusterNodes[1],
      );
      expect(browserTool.execCommandFromNode).toHaveBeenNthCalledWith(
        3,
        mockClientOptions,
        BrowserToolKeysCommands.DbSize,
        [],
        mockClusterNodes[2],
      );
      expect(browserTool.execCommandFromNode).toHaveBeenNthCalledWith(
        4,
        mockClientOptions,
        BrowserToolKeysCommands.Scan,
        ['0', 'MATCH', '*', 'COUNT', args.count],
        mockClusterNodes[0],
        null,
      );
      expect(browserTool.execCommandFromNode).toHaveBeenNthCalledWith(
        5,
        mockClientOptions,
        BrowserToolKeysCommands.Scan,
        ['0', 'MATCH', '*', 'COUNT', args.count],
        mockClusterNodes[1],
        null,
      );
      expect(browserTool.execCommandFromNode).toHaveBeenNthCalledWith(
        6,
        mockClientOptions,
        BrowserToolKeysCommands.Scan,
        ['0', 'MATCH', '*', 'COUNT', args.count],
        mockClusterNodes[2],
        null,
      );
      expect(browserTool.execCommandFromNode).toHaveBeenNthCalledWith(
        7,
        mockClientOptions,
        BrowserToolKeysCommands.Scan,
        ['1', 'MATCH', '*', 'COUNT', args.count],
        mockClusterNodes[0],
        null,
      );
      expect(browserTool.execCommandFromNode).toHaveBeenNthCalledWith(
        8,
        mockClientOptions,
        BrowserToolKeysCommands.Scan,
        ['1', 'MATCH', '*', 'COUNT', args.count],
        mockClusterNodes[1],
        null,
      );
      expect(browserTool.execCommandFromNode).toHaveBeenNthCalledWith(
        9,
        mockClientOptions,
        BrowserToolKeysCommands.Scan,
        ['2', 'MATCH', '*', 'COUNT', args.count],
        mockClusterNodes[0],
        null,
      );
    });
    it('should call scan 3,2,N times per nodes until threshold exceeds', async () => {
      const args = { ...getKeysDto, count: 100 };
      when(browserTool.execCommandFromNode)
        .calledWith(
          mockClientOptions,
          BrowserToolKeysCommands.DbSize,
          [],
          mockClusterNodes[0],
        )
        .mockResolvedValue({ result: 3000 });
      when(browserTool.execCommandFromNode)
        .calledWith(
          mockClientOptions,
          BrowserToolKeysCommands.Scan,
          ['0', 'MATCH', '*', 'COUNT', args.count],
          mockClusterNodes[0],
          null,
        )
        .mockResolvedValue({ result: ['1', [Buffer.from(getKeyInfoResponse.name)]] });
      when(browserTool.execCommandFromNode)
        .calledWith(
          mockClientOptions,
          BrowserToolKeysCommands.Scan,
          ['1', 'MATCH', '*', 'COUNT', args.count],
          mockClusterNodes[0],
          null,
        )
        .mockResolvedValue({ result: ['2', [Buffer.from(getKeyInfoResponse.name)]] });
      when(browserTool.execCommandFromNode)
        .calledWith(
          mockClientOptions,
          BrowserToolKeysCommands.Scan,
          ['2', 'MATCH', '*', 'COUNT', args.count],
          mockClusterNodes[0],
          null,
        )
        .mockResolvedValue({ result: ['0', [Buffer.from(getKeyInfoResponse.name)]] });
      when(browserTool.execCommandFromNode)
        .calledWith(
          mockClientOptions,
          BrowserToolKeysCommands.DbSize,
          [],
          mockClusterNodes[1],
        )
        .mockResolvedValue({ result: 2000 });
      when(browserTool.execCommandFromNode)
        .calledWith(
          mockClientOptions,
          BrowserToolKeysCommands.Scan,
          ['0', 'MATCH', '*', 'COUNT', args.count],
          mockClusterNodes[1],
          null,
        )
        .mockResolvedValue({ result: ['1', [Buffer.from(getKeyInfoResponse.name)]] });
      when(browserTool.execCommandFromNode)
        .calledWith(
          mockClientOptions,
          BrowserToolKeysCommands.Scan,
          ['1', 'MATCH', '*', 'COUNT', args.count],
          mockClusterNodes[1],
          null,
        )
        .mockResolvedValue({ result: ['0', [Buffer.from(getKeyInfoResponse.name)]] });
      when(browserTool.execCommandFromNode)
        .calledWith(
          mockClientOptions,
          BrowserToolKeysCommands.DbSize,
          [],
          mockClusterNodes[2],
        )
        .mockResolvedValue({ result: 1000000 });
      when(browserTool.execCommandFromNode)
        .calledWith(
          mockClientOptions,
          BrowserToolKeysCommands.Scan,
          expect.anything(),
          mockClusterNodes[2],
          null,
        )
        .mockResolvedValue({ result: ['1', []] });

      strategy.getKeysInfo = mockGetKeysInfoFn;

      const result = await strategy.getKeys(mockClientOptions, args);

      expect(result).toEqual([
        {
          ...mockClusterNodesEmptyResult[0],
          total: 3000,
          scanned: args.count * 3,
          keys: new Array(3).fill(getKeyInfoResponse),
        },
        {
          ...mockClusterNodesEmptyResult[1],
          total: 2000,
          scanned: args.count * 2,
          keys: new Array(2).fill(getKeyInfoResponse),
        },
        {
          ...mockClusterNodesEmptyResult[2],
          total: 1000000,
          cursor: 1,
          scanned:
            Math.trunc(REDIS_SCAN_CONFIG.countThreshold / args.count)
              * args.count
              - 5 * args.count, // 5 = scan for other shards (3 and 2)
          keys: [],
        },
      ]);
      expect(strategy.getKeysInfo).toHaveBeenCalled();
      expect(browserTool.execCommandFromNode).toBeCalledTimes(
        Math.trunc(REDIS_SCAN_CONFIG.countThreshold / args.count) + 3,
      ); // 3 = DB keys calls
      expect(browserTool.execCommandFromNode).toHaveBeenNthCalledWith(
        1,
        mockClientOptions,
        BrowserToolKeysCommands.DbSize,
        [],
        mockClusterNodes[0],
      );
      expect(browserTool.execCommandFromNode).toHaveBeenNthCalledWith(
        2,
        mockClientOptions,
        BrowserToolKeysCommands.DbSize,
        [],
        mockClusterNodes[1],
      );
      expect(browserTool.execCommandFromNode).toHaveBeenNthCalledWith(
        3,
        mockClientOptions,
        BrowserToolKeysCommands.DbSize,
        [],
        mockClusterNodes[2],
      );
      expect(browserTool.execCommandFromNode).toHaveBeenNthCalledWith(
        4,
        mockClientOptions,
        BrowserToolKeysCommands.Scan,
        ['0', 'MATCH', '*', 'COUNT', args.count],
        mockClusterNodes[0],
        null,
      );
      expect(browserTool.execCommandFromNode).toHaveBeenNthCalledWith(
        5,
        mockClientOptions,
        BrowserToolKeysCommands.Scan,
        ['0', 'MATCH', '*', 'COUNT', args.count],
        mockClusterNodes[1],
        null,
      );
      expect(browserTool.execCommandFromNode).toHaveBeenNthCalledWith(
        6,
        mockClientOptions,
        BrowserToolKeysCommands.Scan,
        ['0', 'MATCH', '*', 'COUNT', args.count],
        mockClusterNodes[2],
        null,
      );
      expect(browserTool.execCommandFromNode).toHaveBeenNthCalledWith(
        7,
        mockClientOptions,
        BrowserToolKeysCommands.Scan,
        ['1', 'MATCH', '*', 'COUNT', args.count],
        mockClusterNodes[0],
        null,
      );
      expect(browserTool.execCommandFromNode).toHaveBeenNthCalledWith(
        8,
        mockClientOptions,
        BrowserToolKeysCommands.Scan,
        ['1', 'MATCH', '*', 'COUNT', args.count],
        mockClusterNodes[1],
        null,
      );
      expect(browserTool.execCommandFromNode).toHaveBeenNthCalledWith(
        9,
        mockClientOptions,
        BrowserToolKeysCommands.Scan,
        ['1', 'MATCH', '*', 'COUNT', args.count],
        mockClusterNodes[2],
        null,
      );
      expect(browserTool.execCommandFromNode).toHaveBeenNthCalledWith(
        10,
        mockClientOptions,
        BrowserToolKeysCommands.Scan,
        ['2', 'MATCH', '*', 'COUNT', args.count],
        mockClusterNodes[0],
        null,
      );
      expect(browserTool.execCommandFromNode).toHaveBeenNthCalledWith(
        11,
        mockClientOptions,
        BrowserToolKeysCommands.Scan,
        ['1', 'MATCH', '*', 'COUNT', args.count],
        mockClusterNodes[2],
        null,
      );
      expect(browserTool.execCommandFromNode).toHaveBeenNthCalledWith(
        12,
        mockClientOptions,
        BrowserToolKeysCommands.Scan,
        ['1', 'MATCH', '*', 'COUNT', args.count],
        mockClusterNodes[2],
        null,
      );
    });
    it('should not call scan when total is 0', async () => {
      const args = { ...getKeysDto, count: undefined };
      when(browserTool.execCommandFromNode)
        .calledWith(
          mockClientOptions,
          BrowserToolKeysCommands.DbSize,
          [],
          expect.anything(),
        )
        .mockResolvedValue({ result: 0 });

      strategy.getKeysInfo = mockGetKeysInfoFn;

      const result = await strategy.getKeys(mockClientOptions, args);

      expect(result).toEqual([
        {
          ...mockClusterNodesEmptyResult[0],
          total: 0,
          scanned: 0,
          keys: [],
        },
        {
          ...mockClusterNodesEmptyResult[1],
          total: 0,
          scanned: 0,
          keys: [],
        },
        {
          ...mockClusterNodesEmptyResult[2],
          total: 0,
          scanned: 0,
          keys: [],
        },
      ]);
      expect(strategy.getKeysInfo).toBeCalledTimes(0);
      expect(browserTool.execCommandFromNode).toBeCalledTimes(3); // 3 = DB keys calls
      expect(browserTool.execCommandFromNode).toHaveBeenNthCalledWith(
        1,
        mockClientOptions,
        BrowserToolKeysCommands.DbSize,
        [],
        mockClusterNodes[0],
      );
      expect(browserTool.execCommandFromNode).toHaveBeenNthCalledWith(
        2,
        mockClientOptions,
        BrowserToolKeysCommands.DbSize,
        [],
        mockClusterNodes[1],
      );
      expect(browserTool.execCommandFromNode).toHaveBeenNthCalledWith(
        3,
        mockClientOptions,
        BrowserToolKeysCommands.DbSize,
        [],
        mockClusterNodes[2],
      );
    });
    it('should work with custom cursor', async () => {
      const args = {
        ...getKeysDto,
        cursor: '172.1.0.1:7000@0||172.1.0.1:7001@0||172.1.0.1:7002@0',
      };
      when(browserTool.execCommandFromNode)
        .calledWith(
          mockClientOptions,
          BrowserToolKeysCommands.DbSize,
          [],
          expect.anything(),
        )
        .mockResolvedValue({ result: 0 });

      strategy.getKeysInfo = mockGetKeysInfoFn;

      const result = await strategy.getKeys(mockClientOptions, args);

      expect(result).toEqual([
        {
          ...mockClusterNodesEmptyResult[0],
          total: 0,
          scanned: 0,
          keys: [],
        },
        {
          ...mockClusterNodesEmptyResult[1],
          total: 0,
          scanned: 0,
          keys: [],
        },
        {
          ...mockClusterNodesEmptyResult[2],
          total: 0,
          scanned: 0,
          keys: [],
        },
      ]);
      expect(strategy.getKeysInfo).toBeCalledTimes(0);
      expect(browserTool.execCommandFromNode).toBeCalledTimes(3); // 3 = DB keys calls
      expect(browserTool.execCommandFromNode).toHaveBeenNthCalledWith(
        1,
        mockClientOptions,
        BrowserToolKeysCommands.DbSize,
        [],
        mockClusterNodes[0],
      );
      expect(browserTool.execCommandFromNode).toHaveBeenNthCalledWith(
        2,
        mockClientOptions,
        BrowserToolKeysCommands.DbSize,
        [],
        mockClusterNodes[1],
      );
      expect(browserTool.execCommandFromNode).toHaveBeenNthCalledWith(
        3,
        mockClientOptions,
        BrowserToolKeysCommands.DbSize,
        [],
        mockClusterNodes[2],
      );
    });
    it('should skip nodes with negative cursors custom cursor', async () => {
      const args = {
        ...getKeysDto,
        cursor: '172.1.0.1:7000@0||172.1.0.1:7001@-1||172.1.0.1:7002@-22',
      };
      when(browserTool.execCommandFromNode)
        .calledWith(
          mockClientOptions,
          BrowserToolKeysCommands.DbSize,
          [],
          expect.anything(),
        )
        .mockResolvedValue({ result: 0 });

      strategy.getKeysInfo = mockGetKeysInfoFn;

      const result = await strategy.getKeys(mockClientOptions, args);

      expect(result).toEqual([
        {
          ...mockClusterNodesEmptyResult[0],
          total: 0,
          scanned: 0,
          keys: [],
        },
      ]);
      expect(strategy.getKeysInfo).toBeCalledTimes(0);
      expect(browserTool.execCommandFromNode).toBeCalledTimes(1);
      expect(browserTool.execCommandFromNode).toHaveBeenNthCalledWith(
        1,
        mockClientOptions,
        BrowserToolKeysCommands.DbSize,
        [],
        mockClusterNodes[0],
      );
    });
    it('should throw error if incorrect cursor passed', async () => {
      try {
        const args = {
          ...getKeysDto,
          cursor: '172.1.0.1asd00@0||172.1.0.1:7001@0||172.1.0.1:7002@0',
        };
        await strategy.getKeys(mockClientOptions, args);
        fail();
      } catch (err) {
        expect(err.message).toEqual(
          ERROR_MESSAGES.INCORRECT_CLUSTER_CURSOR_FORMAT,
        );
      }
    });
    it('should throw error on dbsize command', async () => {
      const args = { ...getKeysDto };

      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'DBSIZE',
      };

      when(browserTool.execCommandFromNode)
        .calledWith(
          mockClientOptions,
          BrowserToolKeysCommands.DbSize,
          expect.anything(),
          expect.anything(),
      )
        .mockRejectedValue(replyError);
      when(browserTool.execCommandFromNode)
        .calledWith(
          mockClientOptions,
          BrowserToolKeysCommands.Scan,
          expect.anything(),
          expect.anything(),
          null,
        )
        .mockResolvedValue({ result: [0, [Buffer.from(getKeyInfoResponse.name)]] });      
        strategy.getKeysInfo = jest
          .fn()
          .mockResolvedValue([getKeyInfoResponse]);
      
      const result = await strategy.getKeys(mockClientOptions, args);
      
      expect(result).toEqual([
        {
          ...mockClusterNodesEmptyResult[0],
          total: null,
          scanned: getKeysDto.count,
          keys: [getKeyInfoResponse],
        },
        {
          ...mockClusterNodesEmptyResult[1],
          total: null,
          scanned: getKeysDto.count,
          keys: [getKeyInfoResponse],
        },
        {
          ...mockClusterNodesEmptyResult[2],
          total: null,
          scanned: getKeysDto.count,
          keys: [getKeyInfoResponse],
        },
      ]);
    });
    it('should throw error on scan command', async () => {
      const args = { ...getKeysDto };

      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'SCAN',
      };

      when(browserTool.execCommandFromNode)
        .calledWith(
          mockClientOptions,
          BrowserToolKeysCommands.DbSize,
          expect.anything(),
          expect.anything(),
        )
        .mockResolvedValue({ result: 1 });
      when(browserTool.execCommandFromNode)
        .calledWith(
          mockClientOptions,
          BrowserToolKeysCommands.Scan,
          expect.anything(),
          expect.anything(),
          null,
        )
        .mockRejectedValue(replyError);

      try {
        await strategy.getKeys(mockClientOptions, args);
        fail();
      } catch (err) {
        expect(err.message).toEqual(replyError.message);
      }
    });
    describe('get keys by glob patter', () => {
      beforeEach(async () => {
        when(browserTool.execCommandFromNode)
          .calledWith(
            mockClientOptions,
            BrowserToolKeysCommands.DbSize,
            [],
            expect.anything(),
          )
          .mockResolvedValue({ result: 10 });
        strategy.scanNodes = jest.fn();
      });
      it("should call scan when math contains '?' glob", async () => {
        const dto: GetKeysDto = { ...getKeysDto, match: 'test?tring' };
        strategy.getKeysInfo = jest
          .fn()
          .mockResolvedValue([getKeyInfoResponse]);

        await strategy.getKeys(mockClientOptions, dto);

        expect(strategy.scanNodes).toHaveBeenCalled();
      });
      it("should call scan when math contains '*' glob", async () => {
        const dto: GetKeysDto = { ...getKeysDto, match: 'test*' };
        strategy.getKeysInfo = jest
          .fn()
          .mockResolvedValue([getKeyInfoResponse]);

        await strategy.getKeys(mockClientOptions, dto);

        expect(strategy.scanNodes).toHaveBeenCalled();
      });
      it("should call scan when math contains '[ae]' glob", async () => {
        const dto: GetKeysDto = { ...getKeysDto, match: 't[ae]stString' };
        strategy.getKeysInfo = jest
          .fn()
          .mockResolvedValue([getKeyInfoResponse]);

        await strategy.getKeys(mockClientOptions, dto);

        expect(strategy.scanNodes).toHaveBeenCalled();
      });
      it("should call scan when math contains '[a-e]' glob", async () => {
        const dto: GetKeysDto = { ...getKeysDto, match: 't[a-e]stString' };
        strategy.getKeysInfo = jest
          .fn()
          .mockResolvedValue([getKeyInfoResponse]);

        await strategy.getKeys(mockClientOptions, dto);

        expect(strategy.scanNodes).toHaveBeenCalled();
      });
      it("should call scan when math contains '[^e]' glob", async () => {
        const dto: GetKeysDto = { ...getKeysDto, match: 't[^e]stString' };
        strategy.getKeysInfo = jest
          .fn()
          .mockResolvedValue([getKeyInfoResponse]);

        await strategy.getKeys(mockClientOptions, dto);

        expect(strategy.scanNodes).toHaveBeenCalled();
      });
      it('should not call scan when math contains escaped glob', async () => {
        const dto: GetKeysDto = { ...getKeysDto, match: 't\\[a-e\\]stString' };
        strategy.getKeysInfo = jest
          .fn()
          .mockResolvedValue([getKeyInfoResponse]);

        await strategy.getKeys(mockClientOptions, dto);

        expect(strategy.scanNodes).not.toHaveBeenCalled();
      });
    });
    describe('find exact key', () => {
      const key = getKeyInfoResponse.name;
      const total = 10;
      beforeEach(async () => {
        when(browserTool.execCommandFromNode)
          .calledWith(
            mockClientOptions,
            BrowserToolKeysCommands.DbSize,
            [],
            expect.anything(),
          )
          .mockResolvedValue({ result: total });
        strategy.scanNodes = jest.fn();
        strategy.getKeyInfo = jest
          .fn()
          .mockResolvedValue(getKeyInfoResponse);
      });
      it('should find exact key when match is not glob patter', async () => {
        const dto: GetKeysDto = { ...getKeysDto, match: key };
        strategy.getKeyInfo = jest
          .fn()
          .mockResolvedValue(getKeyInfoResponse);

        const result = await strategy.getKeys(mockClientOptions, dto);

        expect(result).toEqual([
          {
            ...mockClusterNodesEmptyResult[0],
            total,
            scanned: total,
            keys: [getKeyInfoResponse],
          },
          {
            ...mockClusterNodesEmptyResult[1],
            total,
            scanned: total,
          },
          {
            ...mockClusterNodesEmptyResult[2],
            total,
            scanned: total,
          },
        ]);
        expect(strategy.getKeyInfo).toHaveBeenCalledWith(clusterClient, key);
        expect(strategy.scanNodes).not.toHaveBeenCalled();
      });
      it('should find exact key when match is escaped glob patter', async () => {
        const dto: GetKeysDto = { ...getKeysDto, match: 'testString\\*' };
        const searchPattern = 'testString*';
        strategy.getKeyInfo = jest
          .fn()
          .mockResolvedValue({ ...getKeyInfoResponse, name: searchPattern });

        const result = await strategy.getKeys(mockClientOptions, dto);

        expect(result).toEqual([
          {
            ...mockClusterNodesEmptyResult[0],
            total,
            scanned: total,
            keys: [{ ...getKeyInfoResponse, name: searchPattern }],
          },
          {
            ...mockClusterNodesEmptyResult[1],
            total,
            scanned: total,
          },
          {
            ...mockClusterNodesEmptyResult[2],
            total,
            scanned: total,
          },
        ]);
        expect(strategy.getKeyInfo).toHaveBeenCalledWith(clusterClient, searchPattern);
        expect(strategy.scanNodes).not.toHaveBeenCalled();
      });
      it('should find exact key with correct type', async () => {
        const dto: GetKeysDto = {
          ...getKeysDto,
          match: key,
          type: RedisDataType.String,
        };
        strategy.getKeysInfo = jest
          .fn()
          .mockResolvedValue([getKeyInfoResponse]);

        const result = await strategy.getKeys(mockClientOptions, dto);

        expect(result).toEqual([
          {
            ...mockClusterNodesEmptyResult[0],
            total,
            scanned: total,
            keys: [getKeyInfoResponse],
          },
          {
            ...mockClusterNodesEmptyResult[1],
            total,
            scanned: total,
          },
          {
            ...mockClusterNodesEmptyResult[2],
            total,
            scanned: total,
          },
        ]);
      });
      it('should return empty array if key not exist', async () => {
        const dto: GetKeysDto = { ...getKeysDto, match: key };
        strategy.getKeyInfo = jest.fn().mockResolvedValue({
          name: 'testString',
          type: 'none',
          ttl: -2,
          size: null,
        });

        const result = await strategy.getKeys(mockClientOptions, dto);

        expect(result).toEqual([
          {
            ...mockClusterNodesEmptyResult[0],
            total,
            scanned: total,
            keys: [],
          },
          {
            ...mockClusterNodesEmptyResult[1],
            total,
            scanned: total,
          },
          {
            ...mockClusterNodesEmptyResult[2],
            total,
            scanned: total,
          },
        ]);
      });
      it('should return empty array if key has wrong type', async () => {
        const dto: GetKeysDto = {
          ...getKeysDto,
          match: key,
          type: RedisDataType.Hash,
        };
        strategy.getKeysInfo = jest
          .fn()
          .mockResolvedValue([getKeyInfoResponse]);

        const result = await strategy.getKeys(mockClientOptions, dto);

        expect(result).toEqual([
          {
            ...mockClusterNodesEmptyResult[0],
            total,
            scanned: total,
            keys: [],
          },
          {
            ...mockClusterNodesEmptyResult[1],
            total,
            scanned: total,
          },
          {
            ...mockClusterNodesEmptyResult[2],
            total,
            scanned: total,
          },
        ]);
      });
    });
  });
});
