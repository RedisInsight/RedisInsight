import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import {
  mockRedisConsumer,
  mockRedisNoPermError,
  mockBrowserClientMetadata,
} from 'src/__mocks__';
import {
  BrowserToolKeysCommands,
  BrowserToolTSCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { ReplyError } from 'src/models';
import { GetKeyInfoResponse, RedisDataType } from 'src/modules/browser/keys/dto';
import { BrowserToolService } from 'src/modules/browser/services/browser-tool/browser-tool.service';
import { TSTypeInfoStrategy } from 'src/modules/browser/keys/strategies';

const getKeyInfoResponse: GetKeyInfoResponse = {
  name: 'testTS',
  type: 'TSDB-TYPE',
  ttl: -1,
  size: 50,
  length: 10,
};

const mockTSInfoReply = [
  'totalSamples',
  10,
  'memoryUsage',
  4239,
  'firstTimestamp',
  0,
  'lastTimestamp',
  0,
  'retentionTime',
  6000,
  'chunkCount',
  1,
  'chunkSize',
  4096,
];

describe('TSTypeInfoStrategy', () => {
  let strategy: TSTypeInfoStrategy;
  let browserTool;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: BrowserToolService,
          useFactory: mockRedisConsumer,
        },
      ],
    }).compile();

    browserTool = module.get<BrowserToolService>(BrowserToolService);
    strategy = new TSTypeInfoStrategy(browserTool);
  });

  describe('getInfo', () => {
    const key = getKeyInfoResponse.name;
    beforeEach(() => {
      when(browserTool.execPipeline)
        .calledWith(mockBrowserClientMetadata, [
          [BrowserToolKeysCommands.Ttl, key],
          [BrowserToolKeysCommands.MemoryUsage, key, 'samples', '0'],
        ])
        .mockResolvedValue([
          null,
          [
            [null, -1],
            [null, 50],
          ],
        ]);
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolTSCommands.TSInfo, [key], 'utf8')
        .mockResolvedValue(mockTSInfoReply);
    });
    it('should return appropriate value', async () => {
      const result = await strategy.getInfo(
        mockBrowserClientMetadata,
        key,
        RedisDataType.TS,
      );

      expect(result).toEqual(getKeyInfoResponse);
    });
    it('should throw error', async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: BrowserToolKeysCommands.Ttl,
      };
      when(browserTool.execPipeline)
        .calledWith(mockBrowserClientMetadata, [
          [BrowserToolKeysCommands.Ttl, key],
          [BrowserToolKeysCommands.MemoryUsage, key, 'samples', '0'],
        ])
        .mockResolvedValue([replyError, []]);

      try {
        await strategy.getInfo(mockBrowserClientMetadata, key, RedisDataType.TS);
        fail('Should throw an error');
      } catch (err) {
        expect(err.message).toEqual(replyError.message);
      }
    });
    it('should return size with null value', async () => {
      const replyError: ReplyError = {
        name: 'ReplyError',
        command: BrowserToolKeysCommands.MemoryUsage,
        message: "ERR unknown command 'memory'",
      };
      when(browserTool.execPipeline)
        .calledWith(mockBrowserClientMetadata, [
          [BrowserToolKeysCommands.Ttl, key],
          [BrowserToolKeysCommands.MemoryUsage, key, 'samples', '0'],
        ])
        .mockResolvedValue([
          null,
          [
            [null, -1],
            [replyError, null],
          ],
        ]);

      const result = await strategy.getInfo(
        mockBrowserClientMetadata,
        key,
        RedisDataType.TS,
      );

      expect(result).toEqual({ ...getKeyInfoResponse, size: null });
    });
    it('should return result without length', async () => {
      const replyError: ReplyError = {
        name: 'ReplyError',
        command: BrowserToolTSCommands.TSInfo,
        message: "ERR unknown command 'ts.info'",
      };
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolTSCommands.TSInfo, [key], 'utf8')
        .mockResolvedValue(replyError);

      const result = await strategy.getInfo(
        mockBrowserClientMetadata,
        key,
        RedisDataType.TS,
      );

      expect(result).toEqual({ ...getKeyInfoResponse, length: undefined });
    });
  });
});
