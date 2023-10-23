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
  BrowserToolZSetCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { GetKeyInfoResponse, RedisDataType } from 'src/modules/browser/keys/keys.dto';
import { BrowserToolService } from 'src/modules/browser/services/browser-tool/browser-tool.service';
import { ZSetTypeInfoStrategy } from './z-set-type-info.strategy';

const getKeyInfoResponse: GetKeyInfoResponse = {
  name: 'testZSet',
  type: 'zset',
  ttl: -1,
  size: 50,
  length: 10,
};

describe('ZSetTypeInfoStrategy', () => {
  let strategy: ZSetTypeInfoStrategy;
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
    strategy = new ZSetTypeInfoStrategy(browserTool);
  });

  describe('getInfo', () => {
    const key = getKeyInfoResponse.name;
    it('should return appropriate value', async () => {
      when(browserTool.execPipeline)
        .calledWith(mockBrowserClientMetadata, [
          [BrowserToolKeysCommands.Ttl, key],
          [BrowserToolKeysCommands.MemoryUsage, key, 'samples', '0'],
          [BrowserToolZSetCommands.ZCard, key],
        ])
        .mockResolvedValue([
          null,
          [
            [null, -1],
            [null, 50],
            [null, 10],
          ],
        ]);

      const result = await strategy.getInfo(
        mockBrowserClientMetadata,
        key,
        RedisDataType.ZSet,
      );

      expect(result).toEqual(getKeyInfoResponse);
    });
    it('should throw error', async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: BrowserToolKeysCommands.Type,
      };
      when(browserTool.execPipeline)
        .calledWith(mockBrowserClientMetadata, [
          [BrowserToolKeysCommands.Ttl, key],
          [BrowserToolKeysCommands.MemoryUsage, key, 'samples', '0'],
          [BrowserToolZSetCommands.ZCard, key],
        ])
        .mockResolvedValue([replyError, []]);

      try {
        await strategy.getInfo(mockBrowserClientMetadata, key, RedisDataType.ZSet);
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
          [BrowserToolZSetCommands.ZCard, key],
        ])
        .mockResolvedValue([
          null,
          [
            [null, -1],
            [replyError, null],
            [null, 10],
          ],
        ]);

      const result = await strategy.getInfo(
        mockBrowserClientMetadata,
        key,
        RedisDataType.ZSet,
      );

      expect(result).toEqual({ ...getKeyInfoResponse, size: null });
    });
  });
});
