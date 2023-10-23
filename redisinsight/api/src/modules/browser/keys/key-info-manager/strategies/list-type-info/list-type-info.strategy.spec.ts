import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import {
  mockRedisConsumer,
  mockRedisNoPermError,
  mockBrowserClientMetadata,
} from 'src/__mocks__';
import {
  BrowserToolKeysCommands,
  BrowserToolListCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { ReplyError } from 'src/models';
import { GetKeyInfoResponse, RedisDataType } from 'src/modules/browser/keys/keys.dto';
import { BrowserToolService } from 'src/modules/browser/services/browser-tool/browser-tool.service';
import { ListTypeInfoStrategy } from './list-type-info.strategy';

const getKeyInfoResponse: GetKeyInfoResponse = {
  name: 'testList',
  type: 'list',
  ttl: -1,
  size: 50,
  length: 10,
};

describe('ListTypeInfoStrategy', () => {
  let strategy: ListTypeInfoStrategy;
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
    strategy = new ListTypeInfoStrategy(browserTool);
  });

  describe('getInfo', () => {
    const key = getKeyInfoResponse.name;
    it('should return appropriate value', async () => {
      when(browserTool.execPipeline)
        .calledWith(mockBrowserClientMetadata, [
          [BrowserToolKeysCommands.Ttl, key],
          [BrowserToolKeysCommands.MemoryUsage, key, 'samples', '0'],
          [BrowserToolListCommands.LLen, key],
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
        RedisDataType.List,
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
          [BrowserToolListCommands.LLen, key],
        ])
        .mockResolvedValue([replyError, []]);

      try {
        await strategy.getInfo(mockBrowserClientMetadata, key, RedisDataType.List);
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
          [BrowserToolListCommands.LLen, key],
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
        RedisDataType.List,
      );

      expect(result).toEqual({ ...getKeyInfoResponse, size: null });
    });
  });
});
