import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import {
  mockAppSettingsInitial,
  mockRedisConsumer,
  mockRedisNoPermError, mockSettingsService,
  mockDatabase,
} from 'src/__mocks__';
import { ReplyError } from 'src/models';
import config from 'src/utils/config';
import { BrowserToolService } from 'src/modules/browser/services/browser-tool/browser-tool.service';
import { GetKeysDto, RedisDataType } from 'src/modules/browser/dto';
import { BrowserToolKeysCommands } from 'src/modules/browser/constants/browser-tool-commands';
import { IFindRedisClientInstanceByOptions } from 'src/modules/redis/redis.service';
import { IGetNodeKeysResult } from 'src/modules/browser/services/keys-business/scanner/scanner.interface';
import IORedis from 'ioredis';
import { SettingsService } from 'src/modules/settings/settings.service';
import { StandaloneStrategy } from './standalone.strategy';

const REDIS_SCAN_CONFIG = config.get('redis_scan');
const mockClientOptions: IFindRedisClientInstanceByOptions = {
  instanceId: mockDatabase.id,
};

const nodeClient = Object.create(IORedis.prototype);
nodeClient.sendCommand = jest.fn();

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

const mockRedisKeyspaceInfoResponse_1: string = '# Keyspace\r\ndb0:keys=1,expires=0,avg_ttl=0\r\n';
const mockRedisKeyspaceInfoResponse_2: string = '# Keyspace\r\ndb0:keys=1000000,expires=0,avg_ttl=0\r\n';
const mockRedisKeyspaceInfoResponse_3: string = '# Keyspace\r\n \r\n';
const mockRedisKeyspaceInfoResponse_4: string = '# Keyspace\r\ndb0:keys=10,expires=0,avg_ttl=0\r\n';

let strategy;
let browserTool;
let settingsService;

describe('Standalone Scanner Strategy', () => {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: BrowserToolService,
          useFactory: mockRedisConsumer,
        },
        {
          provide: SettingsService,
          useFactory: mockSettingsService,
        },
      ],
    }).compile();

    browserTool = module.get<BrowserToolService>(BrowserToolService);
    settingsService = module.get(SettingsService);
    settingsService.getAppSettings.mockResolvedValue(mockAppSettingsInitial);
    strategy = new StandaloneStrategy(browserTool, settingsService);
    browserTool.getRedisClient.mockResolvedValue(nodeClient);
  });
  describe('getKeys', () => {
    const getKeysDto: GetKeysDto = { cursor: '0', count: 15, keysInfo: true };
    it('should return appropriate value with filter by type', async () => {
      const args = { ...getKeysDto, type: 'string', match: 'pattern*' };

      when(browserTool.execCommand)
        .calledWith(
          mockClientOptions,
          BrowserToolKeysCommands.Scan,
          expect.anything(),
          null,
        )
        .mockResolvedValue([0, [getKeyInfoResponse.name]]);
      when(browserTool.execCommand)
        .calledWith(
          mockClientOptions,
          BrowserToolKeysCommands.InfoKeyspace,
          expect.anything(),
          'utf8',
        )
        .mockResolvedValue(mockRedisKeyspaceInfoResponse_1);

      strategy.getKeysInfo = jest.fn().mockResolvedValue([getKeyInfoResponse]);

      const result = await strategy.getKeys(mockClientOptions, args);

      expect(result).toEqual([
        {
          ...mockNodeEmptyResult,
          total: 1,
          scanned: getKeysDto.count,
          keys: [getKeyInfoResponse],
        },
      ]);
      expect(strategy.getKeysInfo).toHaveBeenCalled();
      expect(browserTool.execCommand).toHaveBeenNthCalledWith(
        2,
        mockClientOptions,
        BrowserToolKeysCommands.Scan,
        ['0', 'MATCH', args.match, 'COUNT', args.count, 'TYPE', args.type],
        null,
      );
    });
    it('should return keys names only', async () => {
      const args = {
        ...getKeysDto, type: 'string', match: 'pattern*', keysInfo: false,
      };

      when(browserTool.execCommand)
        .calledWith(
          mockClientOptions,
          BrowserToolKeysCommands.Scan,
          expect.anything(),
          null,
        )
        .mockResolvedValue([0, [getKeyInfoResponse.name]]);
      when(browserTool.execCommand)
        .calledWith(
          mockClientOptions,
          BrowserToolKeysCommands.InfoKeyspace,
          expect.anything(),
          'utf8',
        )
        .mockResolvedValue(mockRedisKeyspaceInfoResponse_1);

      strategy.getKeysInfo = jest.fn();

      const result = await strategy.getKeys(mockClientOptions, args);

      expect(strategy.getKeysInfo).not.toHaveBeenCalled();
      expect(result).toEqual([
        {
          ...mockNodeEmptyResult,
          total: 1,
          scanned: getKeysDto.count,
          keys: [{ name: getKeyInfoResponse.name }],
        },
      ]);
    });
    it('should call scan 3 times and return appropriate value', async () => {
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolKeysCommands.Scan, [
          '0',
          'MATCH',
          '*',
          'COUNT',
          getKeysDto.count,
        ], null)
        .mockResolvedValue(['1', new Array(3).fill(getKeyInfoResponse.name)]);
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolKeysCommands.Scan, [
          '1',
          'MATCH',
          '*',
          'COUNT',
          getKeysDto.count,
        ], null)
        .mockResolvedValue(['2', new Array(3).fill(getKeyInfoResponse.name)]);
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolKeysCommands.Scan, [
          '2',
          'MATCH',
          '*',
          'COUNT',
          getKeysDto.count,
        ], null)
        .mockResolvedValue(['0', new Array(3).fill(getKeyInfoResponse.name)]);
      when(browserTool.execCommand)
        .calledWith(
          mockClientOptions,
          BrowserToolKeysCommands.InfoKeyspace,
          expect.anything(),
          'utf8',
        )
        .mockResolvedValue(mockRedisKeyspaceInfoResponse_2);

      strategy.getKeysInfo = jest
        .fn()
        .mockResolvedValue(new Array(9).fill(getKeyInfoResponse));

      const result = await strategy.getKeys(mockClientOptions, getKeysDto);

      expect(result).toEqual([
        {
          ...mockNodeEmptyResult,
          total: 1000000,
          scanned: getKeysDto.count * 3,
          keys: new Array(9).fill(getKeyInfoResponse),
        },
      ]);
      expect(strategy.getKeysInfo).toHaveBeenCalled();
      expect(browserTool.execCommand).toBeCalledTimes(4);
      expect(browserTool.execCommand).toHaveBeenNthCalledWith(
        1,
        mockClientOptions,
        BrowserToolKeysCommands.InfoKeyspace,
        expect.anything(),
        'utf8',
      );
      expect(browserTool.execCommand).toHaveBeenNthCalledWith(
        2,
        mockClientOptions,
        BrowserToolKeysCommands.Scan,
        ['0', 'MATCH', '*', 'COUNT', getKeysDto.count],
        null,
      );
      expect(browserTool.execCommand).toHaveBeenNthCalledWith(
        3,
        mockClientOptions,
        BrowserToolKeysCommands.Scan,
        ['1', 'MATCH', '*', 'COUNT', getKeysDto.count],
        null,
      );
      expect(browserTool.execCommand).toHaveBeenNthCalledWith(
        4,
        mockClientOptions,
        BrowserToolKeysCommands.Scan,
        ['2', 'MATCH', '*', 'COUNT', getKeysDto.count],
        null,
      );
    });
    it('should call scan N times until threshold exceeds', async () => {
      when(browserTool.execCommand)
        .calledWith(
          mockClientOptions,
          BrowserToolKeysCommands.Scan,
          expect.anything(),
          null,
        )
        .mockResolvedValue(['1', []]);
      when(browserTool.execCommand)
        .calledWith(
          mockClientOptions,
          BrowserToolKeysCommands.InfoKeyspace,
          expect.anything(),
          'utf8',
        )
        .mockResolvedValue(mockRedisKeyspaceInfoResponse_2);

      strategy.getKeysInfo = jest.fn().mockResolvedValue([]);

      const result = await strategy.getKeys(mockClientOptions, getKeysDto);

      expect(result).toEqual([
        {
          ...mockNodeEmptyResult,
          cursor: 1,
          total: 1000000,
          scanned:
            Math.trunc(REDIS_SCAN_CONFIG.countThreshold / getKeysDto.count)
            * getKeysDto.count
            + getKeysDto.count,
          keys: [],
        },
      ]);
      expect(strategy.getKeysInfo).toHaveBeenCalledTimes(0);
      expect(browserTool.execCommand).toHaveBeenNthCalledWith(
        1,
        mockClientOptions,
        BrowserToolKeysCommands.InfoKeyspace,
        expect.anything(),
        'utf8',
      );
    });
    it('should not call scan when total is 0', async () => {
      when(browserTool.execCommand)
        .calledWith(
          mockClientOptions,
          BrowserToolKeysCommands.InfoKeyspace,
          expect.anything(),
          'utf8',
        )
        .mockResolvedValue(mockRedisKeyspaceInfoResponse_3);

      strategy.getKeysInfo = jest.fn().mockResolvedValue([]);

      const result = await strategy.getKeys(mockClientOptions, getKeysDto);

      expect(result).toEqual([
        {
          ...mockNodeEmptyResult,
        },
      ]);
      expect(browserTool.execCommand).toBeCalledTimes(1);
      expect(browserTool.execCommand).toHaveBeenLastCalledWith(
        mockClientOptions,
        BrowserToolKeysCommands.InfoKeyspace,
        expect.anything(),
        'utf8',
      );
      expect(strategy.getKeysInfo).toBeCalledTimes(0);
    });
    it('should call scan with required args', async () => {
      when(browserTool.execCommand)
        .calledWith(
          mockClientOptions,
          BrowserToolKeysCommands.InfoKeyspace,
          expect.anything(),
          'utf8',
        )
        .mockResolvedValue(mockRedisKeyspaceInfoResponse_3);
      strategy.getKeysInfo = jest.fn().mockResolvedValue([]);
      strategy.scan = jest.fn().mockResolvedValue(undefined);

      const result = await strategy.getKeys(mockClientOptions, {
        cursor: '0',
        type: RedisDataType.String,
      });

      expect(strategy.scan).toHaveBeenLastCalledWith(
        mockClientOptions,
        mockNodeEmptyResult,
        '*',
        REDIS_SCAN_CONFIG.countDefault,
        RedisDataType.String,
      );
      expect(result).toEqual([mockNodeEmptyResult]);
      expect(strategy.getKeysInfo).toBeCalledTimes(0);
    });
    it('should throw error on Info Keyspace command', async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'info keyspace',
      };
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolKeysCommands.InfoKeyspace, [], 'utf8')
        .mockRejectedValue(replyError);
      try {
        await strategy.getKeys(mockClientOptions, getKeysDto);
        fail('Should throw an error');
      } catch (err) {
        expect(err.message).toEqual(replyError.message);
      }
    });
    it('should throw error on scan command', async () => {
      when(browserTool.execCommand)
        .calledWith(
          mockClientOptions,
          BrowserToolKeysCommands.InfoKeyspace,
          expect.anything(),
          'utf8',
        )
        .mockResolvedValue(mockRedisKeyspaceInfoResponse_1);

      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'SCAN',
      };
      when(browserTool.execCommand)
        .calledWith(
          mockClientOptions,
          BrowserToolKeysCommands.Scan,
          expect.anything(),
          null,
        )
        .mockRejectedValue(replyError);

      try {
        await strategy.getKeys(mockClientOptions, getKeysDto);
        fail('Should throw an error');
      } catch (err) {
        expect(err.message).toEqual(replyError.message);
      }
    });
    describe('get keys by glob patter', () => {
      beforeEach(async () => {
        when(browserTool.execCommand)
          .calledWith(
            mockClientOptions,
            BrowserToolKeysCommands.InfoKeyspace,
            expect.anything(),
            'utf8',
          )
          .mockResolvedValue(mockRedisKeyspaceInfoResponse_4);
        strategy.scan = jest.fn();
      });
      it("should call scan when math contains '?' glob", async () => {
        const dto: GetKeysDto = { ...getKeysDto, match: 'test?tring' };
        strategy.getKeysInfo = jest
          .fn()
          .mockResolvedValue([getKeyInfoResponse]);

        await strategy.getKeys(mockClientOptions, dto);

        expect(strategy.scan).toHaveBeenCalled();
      });
      it("should call scan when math contains '*' glob", async () => {
        const dto: GetKeysDto = { ...getKeysDto, match: 'test*' };
        strategy.getKeysInfo = jest
          .fn()
          .mockResolvedValue([getKeyInfoResponse]);

        await strategy.getKeys(mockClientOptions, dto);

        expect(strategy.scan).toHaveBeenCalled();
      });
      it("should call scan when math contains '[ae]' glob", async () => {
        const dto: GetKeysDto = { ...getKeysDto, match: 't[ae]stString' };
        strategy.getKeysInfo = jest
          .fn()
          .mockResolvedValue([getKeyInfoResponse]);

        await strategy.getKeys(mockClientOptions, dto);

        expect(strategy.scan).toHaveBeenCalled();
      });
      it("should call scan when math contains '[a-e]' glob", async () => {
        const dto: GetKeysDto = { ...getKeysDto, match: 't[a-e]stString' };
        strategy.getKeysInfo = jest
          .fn()
          .mockResolvedValue([getKeyInfoResponse]);

        await strategy.getKeys(mockClientOptions, dto);

        expect(strategy.scan).toHaveBeenCalled();
      });
      it("should call scan when math contains '[^e]' glob", async () => {
        const dto: GetKeysDto = { ...getKeysDto, match: 't[^e]stString' };
        strategy.getKeysInfo = jest
          .fn()
          .mockResolvedValue([getKeyInfoResponse]);

        await strategy.getKeys(mockClientOptions, dto);

        expect(strategy.scan).toHaveBeenCalled();
      });
      it('should not call scan when math contains escaped glob', async () => {
        const dto: GetKeysDto = { ...getKeysDto, match: 't\\[a-e\\]stString' };
        strategy.getKeysInfo = jest
          .fn()
          .mockResolvedValue([getKeyInfoResponse]);

        await strategy.getKeys(mockClientOptions, dto);

        expect(strategy.scan).not.toHaveBeenCalled();
      });
    });
    describe('find exact key', () => {
      const key = getKeyInfoResponse.name;
      const total = 10;
      beforeEach(async () => {
        when(browserTool.execCommand)
          .calledWith(
            mockClientOptions,
            BrowserToolKeysCommands.InfoKeyspace,
            [],
            'utf8',
          )
          .mockResolvedValue(mockRedisKeyspaceInfoResponse_4);
        strategy.scan = jest.fn();
      });
      it('should find exact key when match is not glob patter', async () => {
        const dto: GetKeysDto = { ...getKeysDto, match: key };
        strategy.getKeysInfo = jest
          .fn()
          .mockResolvedValue([getKeyInfoResponse]);

        const result = await strategy.getKeys(mockClientOptions, dto);

        expect(result).toEqual([
          {
            ...mockNodeEmptyResult,
            total,
            scanned: total,
            keys: [getKeyInfoResponse],
          },
        ]);
        expect(strategy.getKeysInfo).toHaveBeenCalledWith(nodeClient, [
          Buffer.from(key),
        ]);
        expect(strategy.scan).not.toHaveBeenCalled();
      });
      it('should find exact key when match is escaped glob patter', async () => {
        const dto: GetKeysDto = { ...getKeysDto, match: 'testString\\*' };
        const mockSearchPattern = 'testString*';
        strategy.getKeysInfo = jest
          .fn()
          .mockResolvedValue([{ ...getKeyInfoResponse, name: mockSearchPattern }]);

        const result = await strategy.getKeys(mockClientOptions, dto);

        expect(result).toEqual([
          {
            ...mockNodeEmptyResult,
            total,
            scanned: total,
            keys: [{ ...getKeyInfoResponse, name: mockSearchPattern }],
          },
        ]);
        expect(strategy.getKeysInfo).toHaveBeenCalledWith(nodeClient, [Buffer.from(mockSearchPattern)]);
        expect(strategy.scan).not.toHaveBeenCalled();
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
            ...mockNodeEmptyResult,
            total,
            scanned: total,
            keys: [getKeyInfoResponse],
          },
        ]);
      });
      it('should return empty array if key not exist', async () => {
        const dto: GetKeysDto = { ...getKeysDto, match: key };
        strategy.getKeysInfo = jest.fn().mockResolvedValue([
          {
            name: 'testString',
            type: 'none',
            ttl: -2,
            size: null,
          },
        ]);

        const result = await strategy.getKeys(mockClientOptions, dto);

        expect(result).toEqual([
          {
            ...mockNodeEmptyResult,
            total,
            scanned: total,
            keys: [],
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
            ...mockNodeEmptyResult,
            total,
            scanned: total,
            keys: [],
          },
        ]);
      });
    });
  });
});
