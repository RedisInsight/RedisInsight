import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import {
  mockRedisConsumer,
  mockRedisNoPermError,
  mockBrowserClientMetadata,
} from 'src/__mocks__';
import { ReplyError } from 'src/models';
import {
  BrowserToolKeysCommands,
  BrowserToolRejsonRlCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { GetKeyInfoResponse, RedisDataType } from 'src/modules/browser/keys/keys.dto';
import { BrowserToolService } from 'src/modules/browser/services/browser-tool/browser-tool.service';
import { mockKeyDto } from 'src/modules/browser/__mocks__';
import { RejsonRlTypeInfoStrategy } from './rejson-rl-type-info.strategy';

const getKeyInfoResponse: GetKeyInfoResponse = {
  name: mockKeyDto.keyName,
  type: 'ReJSON-RL',
  ttl: -1,
  size: 50,
  length: 10,
};

describe('RejsonRlTypeInfoStrategy', () => {
  let strategy: RejsonRlTypeInfoStrategy;
  let browserTool;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RejsonRlTypeInfoStrategy,
        {
          provide: BrowserToolService,
          useFactory: mockRedisConsumer,
        },
      ],
    }).compile();

    browserTool = module.get<BrowserToolService>(BrowserToolService);
    strategy = new RejsonRlTypeInfoStrategy(browserTool);
  });

  describe('getInfo', () => {
    const key = getKeyInfoResponse.name;
    const path = '.';
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
        .calledWith(mockBrowserClientMetadata, BrowserToolRejsonRlCommands.JsonType, [
          key,
          path,
        ], 'utf8')
        .mockResolvedValue('object');
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolRejsonRlCommands.JsonObjLen, [
          key,
          path,
        ], 'utf8')
        .mockResolvedValue(10);
    });
    it('should return appropriate value for key that store object', async () => {
      const result = await strategy.getInfo(
        mockBrowserClientMetadata,
        key,
        RedisDataType.JSON,
      );

      expect(result).toEqual(getKeyInfoResponse);
    });
    it('should return appropriate value for key that store string', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolRejsonRlCommands.JsonType, [
          key,
          path,
        ])
        .mockResolvedValue('string');
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolRejsonRlCommands.JsonStrLen, [
          key,
          path,
        ], 'utf8')
        .mockResolvedValue(10);

      const result = await strategy.getInfo(
        mockBrowserClientMetadata,
        key,
        RedisDataType.JSON,
      );

      expect(result).toEqual(getKeyInfoResponse);
    });
    it('should return appropriate value for key that store array', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolRejsonRlCommands.JsonType, [
          key,
          path,
        ], 'utf8')
        .mockResolvedValue('array');
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolRejsonRlCommands.JsonArrLen, [
          key,
          path,
        ], 'utf8')
        .mockResolvedValue(10);

      const result = await strategy.getInfo(
        mockBrowserClientMetadata,
        key,
        RedisDataType.JSON,
      );

      expect(result).toEqual(getKeyInfoResponse);
    });
    it('should return appropriate value for key that store not iterable type', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolRejsonRlCommands.JsonType, [
          key,
          path,
        ], 'utf8')
        .mockResolvedValue('boolean');

      const result = await strategy.getInfo(
        mockBrowserClientMetadata,
        key,
        RedisDataType.JSON,
      );

      expect(result).toEqual({ ...getKeyInfoResponse, length: undefined });
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
        await strategy.getInfo(mockBrowserClientMetadata, key, RedisDataType.JSON);
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
        RedisDataType.JSON,
      );

      expect(result).toEqual({ ...getKeyInfoResponse, size: null });
    });
  });
});
