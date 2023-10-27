import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import {
  mockBrowserClientMetadata,
  mockRedisConsumer,
  mockRedisNoPermError,
} from 'src/__mocks__';
import {
  BrowserToolKeysCommands,
  BrowserToolGraphCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { ReplyError } from 'src/models';
import { GetKeyInfoResponse, RedisDataType } from 'src/modules/browser/keys/dto';
import { BrowserToolService } from 'src/modules/browser/services/browser-tool/browser-tool.service';
import { GraphTypeInfoStrategy } from 'src/modules/browser/keys/strategies';

const getKeyInfoResponse: GetKeyInfoResponse = {
  name: 'testGraph',
  type: 'graphdata',
  ttl: -1,
  size: 50,
  length: 10,
};

const mockGraphQueryReply = [
  [[1, 'count(r)']],
  [[[3, getKeyInfoResponse.length]]],
  [
    'Cached execution: 1',
    'Query internal execution time: 0.093200 milliseconds',
  ],
];

describe('GraphTypeInfoStrategy', () => {
  let strategy: GraphTypeInfoStrategy;
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
    strategy = new GraphTypeInfoStrategy(browserTool);
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
        .calledWith(mockBrowserClientMetadata, BrowserToolGraphCommands.GraphQuery, [
          key,
          'MATCH (r) RETURN count(r)',
          '--compact',
        ])
        .mockResolvedValue(mockGraphQueryReply);
    });
    it('should return appropriate value', async () => {
      const result = await strategy.getInfo(
        mockBrowserClientMetadata,
        key,
        RedisDataType.Graph,
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
        await strategy.getInfo(mockBrowserClientMetadata, key, RedisDataType.Graph);
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
        RedisDataType.Graph,
      );

      expect(result).toEqual({ ...getKeyInfoResponse, size: null });
    });
    it('should return result without length', async () => {
      const replyError: ReplyError = {
        name: 'ReplyError',
        command: BrowserToolGraphCommands.GraphQuery,
        message: "ERR unknown command 'graph.query",
      };
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolGraphCommands.GraphQuery, [
          key,
          'MATCH (r) RETURN count(r)',
          '--compact',
        ])
        .mockResolvedValue(replyError);

      const result = await strategy.getInfo(
        mockBrowserClientMetadata,
        key,
        RedisDataType.Graph,
      );

      expect(result).toEqual({ ...getKeyInfoResponse, length: undefined });
    });
  });
});
