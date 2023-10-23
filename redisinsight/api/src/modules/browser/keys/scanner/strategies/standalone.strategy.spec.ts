import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import {
  mockAppSettingsInitial,
  mockRedisConsumer,
  mockRedisNoPermError, mockSettingsService,
  mockBrowserClientMetadata,
} from 'src/__mocks__';
import { ReplyError } from 'src/models';
import config from 'src/utils/config';
import { BrowserToolService } from 'src/modules/browser/services/browser-tool/browser-tool.service';
import { GetKeysDto, RedisDataType } from 'src/modules/browser/keys/keys.dto';
import { BrowserToolKeysCommands } from 'src/modules/browser/constants/browser-tool-commands';
import { IGetNodeKeysResult } from 'src/modules/browser/keys/scanner/scanner.interface';
import IORedis from 'ioredis';
import { SettingsService } from 'src/modules/settings/settings.service';
import * as Utils from 'src/modules/database/utils/database.total.util';
import { StandaloneStrategy } from './standalone.strategy';

const REDIS_SCAN_CONFIG = config.get('redis_scan');

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

const mockGetTotalResponse_1: number = 1;
const mockGetTotalResponse_2: number = 1000000;
const mockGetTotalResponse_3: number = 0;
const mockGetTotalResponse_4: number = 10;

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
      jest.spyOn(Utils, 'getTotal').mockResolvedValue(mockGetTotalResponse_1);

      when(browserTool.execCommand)
        .calledWith(
          mockBrowserClientMetadata,
          BrowserToolKeysCommands.Scan,
          expect.anything(),
          null,
        )
        .mockResolvedValue([0, [getKeyInfoResponse.name]]);

      strategy.getKeysInfo = jest.fn().mockResolvedValue([getKeyInfoResponse]);

      const result = await strategy.getKeys(mockBrowserClientMetadata, args);

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
        1,
        mockBrowserClientMetadata,
        BrowserToolKeysCommands.Scan,
        ['0', 'MATCH', args.match, 'COUNT', args.count, 'TYPE', args.type],
        null,
      );
    });
    it('should return keys names and type only', async () => {
      const args = {
        ...getKeysDto, type: 'string', match: 'pattern*', keysInfo: false,
      };
      jest.spyOn(Utils, 'getTotal').mockResolvedValue(mockGetTotalResponse_1);

      when(browserTool.execCommand)
        .calledWith(
          mockBrowserClientMetadata,
          BrowserToolKeysCommands.Scan,
          expect.anything(),
          null,
        )
        .mockResolvedValue([0, [getKeyInfoResponse.name]]);

      strategy.getKeysInfo = jest.fn();

      const result = await strategy.getKeys(mockBrowserClientMetadata, args);

      expect(strategy.getKeysInfo).not.toHaveBeenCalled();
      expect(result).toEqual([
        {
          ...mockNodeEmptyResult,
          total: 1,
          scanned: getKeysDto.count,
          keys: [{ name: getKeyInfoResponse.name, type: getKeyInfoResponse.type }],
        },
      ]);
    });
    it('should call scan 3 times and return appropriate value', async () => {
      jest.spyOn(Utils, 'getTotal').mockResolvedValue(mockGetTotalResponse_2);

      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Scan, [
          '0',
          'MATCH',
          '*',
          'COUNT',
          getKeysDto.count,
        ], null)
        .mockResolvedValue(['1', new Array(3).fill(getKeyInfoResponse.name)]);
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Scan, [
          '1',
          'MATCH',
          '*',
          'COUNT',
          getKeysDto.count,
        ], null)
        .mockResolvedValue(['2', new Array(3).fill(getKeyInfoResponse.name)]);
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Scan, [
          '2',
          'MATCH',
          '*',
          'COUNT',
          getKeysDto.count,
        ], null)
        .mockResolvedValue(['0', new Array(3).fill(getKeyInfoResponse.name)]);

      strategy.getKeysInfo = jest
        .fn()
        .mockResolvedValue(new Array(9).fill(getKeyInfoResponse));

      const result = await strategy.getKeys(mockBrowserClientMetadata, getKeysDto);

      expect(result).toEqual([
        {
          ...mockNodeEmptyResult,
          total: 1000000,
          scanned: getKeysDto.count * 3,
          keys: new Array(9).fill(getKeyInfoResponse),
        },
      ]);
      expect(strategy.getKeysInfo).toHaveBeenCalled();
      expect(browserTool.execCommand).toBeCalledTimes(3);
      expect(browserTool.execCommand).toHaveBeenNthCalledWith(
        1,
        mockBrowserClientMetadata,
        BrowserToolKeysCommands.Scan,
        ['0', 'MATCH', '*', 'COUNT', getKeysDto.count],
        null,
      );
      expect(browserTool.execCommand).toHaveBeenNthCalledWith(
        2,
        mockBrowserClientMetadata,
        BrowserToolKeysCommands.Scan,
        ['1', 'MATCH', '*', 'COUNT', getKeysDto.count],
        null,
      );
      expect(browserTool.execCommand).toHaveBeenNthCalledWith(
        3,
        mockBrowserClientMetadata,
        BrowserToolKeysCommands.Scan,
        ['2', 'MATCH', '*', 'COUNT', getKeysDto.count],
        null,
      );
    });
    it('should call scan N times until threshold exceeds', async () => {
      jest.spyOn(Utils, 'getTotal').mockResolvedValue(mockGetTotalResponse_2);

      when(browserTool.execCommand)
        .calledWith(
          mockBrowserClientMetadata,
          BrowserToolKeysCommands.Scan,
          expect.anything(),
          null,
        )
        .mockResolvedValue(['1', []]);

      strategy.getKeysInfo = jest.fn().mockResolvedValue([]);

      const result = await strategy.getKeys(mockBrowserClientMetadata, getKeysDto);

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
    });
    it('should call scan N times until threshold exceeds (even when total 0)', async () => {
      jest.spyOn(Utils, 'getTotal').mockResolvedValue(0);

      when(browserTool.execCommand)
        .calledWith(
          mockBrowserClientMetadata,
          BrowserToolKeysCommands.Scan,
          expect.anything(),
          null,
        )
        .mockResolvedValue(['1', []]);

      strategy.getKeysInfo = jest.fn().mockResolvedValue([]);

      const result = await strategy.getKeys(mockBrowserClientMetadata, getKeysDto);

      expect(result).toEqual([
        {
          ...mockNodeEmptyResult,
          cursor: 1,
          total: null,
          scanned:
            Math.trunc(REDIS_SCAN_CONFIG.countThreshold / getKeysDto.count)
            * getKeysDto.count
            + getKeysDto.count,
          keys: [],
        },
      ]);
      expect(strategy.getKeysInfo).toHaveBeenCalledTimes(0);
    });
    it('should call scan with required args', async () => {
      jest.spyOn(Utils, 'getTotal').mockResolvedValue(mockGetTotalResponse_3);

      strategy.getKeysInfo = jest.fn().mockResolvedValue([]);
      strategy.scan = jest.fn().mockResolvedValue(undefined);

      const result = await strategy.getKeys(mockBrowserClientMetadata, {
        cursor: '0',
        type: RedisDataType.String,
      });

      expect(strategy.scan).toHaveBeenLastCalledWith(
        mockBrowserClientMetadata,
        mockNodeEmptyResult,
        '*',
        REDIS_SCAN_CONFIG.countDefault,
        RedisDataType.String,
      );
      expect(result).toEqual([mockNodeEmptyResult]);
      expect(strategy.getKeysInfo).toBeCalledTimes(0);
    });
    it('should throw error on scan command', async () => {
      jest.spyOn(Utils, 'getTotal').mockResolvedValue(mockGetTotalResponse_1);

      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'SCAN',
      };
      when(browserTool.execCommand)
        .calledWith(
          mockBrowserClientMetadata,
          BrowserToolKeysCommands.Scan,
          expect.anything(),
          null,
        )
        .mockRejectedValue(replyError);

      try {
        await strategy.getKeys(mockBrowserClientMetadata, getKeysDto);
        fail('Should throw an error');
      } catch (err) {
        expect(err.message).toEqual(replyError.message);
      }
    });
    describe('get keys by glob patter', () => {
      beforeEach(async () => {
        jest.spyOn(Utils, 'getTotal').mockResolvedValue(mockGetTotalResponse_4);

        strategy.scan = jest.fn();
      });
      it("should call scan when math contains '?' glob", async () => {
        const dto: GetKeysDto = { ...getKeysDto, match: 'test?tring' };
        strategy.getKeysInfo = jest
          .fn()
          .mockResolvedValue([getKeyInfoResponse]);

        await strategy.getKeys(mockBrowserClientMetadata, dto);

        expect(strategy.scan).toHaveBeenCalled();
      });
      it("should call scan when math contains '*' glob", async () => {
        const dto: GetKeysDto = { ...getKeysDto, match: 'test*' };
        strategy.getKeysInfo = jest
          .fn()
          .mockResolvedValue([getKeyInfoResponse]);

        await strategy.getKeys(mockBrowserClientMetadata, dto);

        expect(strategy.scan).toHaveBeenCalled();
      });
      it("should call scan when math contains '[ae]' glob", async () => {
        const dto: GetKeysDto = { ...getKeysDto, match: 't[ae]stString' };
        strategy.getKeysInfo = jest
          .fn()
          .mockResolvedValue([getKeyInfoResponse]);

        await strategy.getKeys(mockBrowserClientMetadata, dto);

        expect(strategy.scan).toHaveBeenCalled();
      });
      it("should call scan when math contains '[a-e]' glob", async () => {
        const dto: GetKeysDto = { ...getKeysDto, match: 't[a-e]stString' };
        strategy.getKeysInfo = jest
          .fn()
          .mockResolvedValue([getKeyInfoResponse]);

        await strategy.getKeys(mockBrowserClientMetadata, dto);

        expect(strategy.scan).toHaveBeenCalled();
      });
      it("should call scan when math contains '[^e]' glob", async () => {
        const dto: GetKeysDto = { ...getKeysDto, match: 't[^e]stString' };
        strategy.getKeysInfo = jest
          .fn()
          .mockResolvedValue([getKeyInfoResponse]);

        await strategy.getKeys(mockBrowserClientMetadata, dto);

        expect(strategy.scan).toHaveBeenCalled();
      });
      it('should not call scan when math contains escaped glob', async () => {
        const dto: GetKeysDto = { ...getKeysDto, match: 't\\[a-e\\]stString' };
        strategy.getKeysInfo = jest
          .fn()
          .mockResolvedValue([getKeyInfoResponse]);

        await strategy.getKeys(mockBrowserClientMetadata, dto);

        expect(strategy.scan).not.toHaveBeenCalled();
      });
    });
    describe('find exact key', () => {
      const key = getKeyInfoResponse.name;
      const total = 10;
      beforeEach(async () => {
        jest.spyOn(Utils, 'getTotal').mockResolvedValue(mockGetTotalResponse_4);

        strategy.scan = jest.fn();
      });
      it('should find exact key when match is not glob patter', async () => {
        const dto: GetKeysDto = { ...getKeysDto, match: key };
        strategy.getKeysInfo = jest
          .fn()
          .mockResolvedValue([getKeyInfoResponse]);

        const result = await strategy.getKeys(mockBrowserClientMetadata, dto, dto.type);

        expect(result).toEqual([
          {
            ...mockNodeEmptyResult,
            total,
            scanned: total,
            keys: [getKeyInfoResponse],
          },
        ]);
        expect(strategy.getKeysInfo).toHaveBeenCalledWith(
          nodeClient,
          [Buffer.from(key)],
          dto.type,
        );
        expect(strategy.scan).not.toHaveBeenCalled();
      });
      it('should find exact key when match is escaped glob patter', async () => {
        const dto: GetKeysDto = { ...getKeysDto, match: 'testString\\*' };
        const mockSearchPattern = 'testString*';
        strategy.getKeysInfo = jest
          .fn()
          .mockResolvedValue([{ ...getKeyInfoResponse, name: mockSearchPattern }]);

        const result = await strategy.getKeys(mockBrowserClientMetadata, dto, dto.type);

        expect(result).toEqual([
          {
            ...mockNodeEmptyResult,
            total,
            scanned: total,
            keys: [{ ...getKeyInfoResponse, name: mockSearchPattern }],
          },
        ]);
        expect(strategy.getKeysInfo).toHaveBeenCalledWith(
          nodeClient,
          [Buffer.from(mockSearchPattern)],
          dto.type,
        );
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

        const result = await strategy.getKeys(mockBrowserClientMetadata, dto);

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

        const result = await strategy.getKeys(mockBrowserClientMetadata, dto);

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

        const result = await strategy.getKeys(mockBrowserClientMetadata, dto);

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
