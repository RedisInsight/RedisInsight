import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import {
  mockStandaloneRedisClient,
  mockLoggerService,
} from 'src/__mocks__';
import {
  BrowserToolKeysCommands,
  BrowserToolListCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { ReplyError } from 'src/models';
import { GetKeyInfoResponse, RedisDataType } from 'src/modules/browser/keys/dto';
import { ListKeyInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/list.key-info.strategy';
import { LoggerService } from 'src/modules/logger/logger.service';

const getKeyInfoResponse: GetKeyInfoResponse = {
  name: 'testList',
  type: 'list',
  ttl: -1,
  size: 50,
  length: 10,
};

describe('ListKeyInfoStrategy', () => {
  let strategy: ListKeyInfoStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListKeyInfoStrategy,
        {
          provide: LoggerService,
          useValue: mockLoggerService,
        },
      ],
    }).compile();

    strategy = module.get(ListKeyInfoStrategy);
  });

  describe('getInfo', () => {
    const key = getKeyInfoResponse.name;
    it('should return appropriate value', async () => {
      when(mockStandaloneRedisClient.sendPipeline)
        .calledWith([
          [BrowserToolKeysCommands.Ttl, key],
          [BrowserToolKeysCommands.MemoryUsage, key, 'samples', '0'],
          [BrowserToolListCommands.LLen, key],
        ])
        .mockResolvedValue([
          [null, -1],
          [null, 50],
          [null, 10],
        ]);

      const result = await strategy.getInfo(
        mockStandaloneRedisClient,
        key,
        RedisDataType.List,
      );

      expect(result).toEqual(getKeyInfoResponse);
    });
    it('should return size with null value', async () => {
      const replyError: ReplyError = {
        name: 'ReplyError',
        command: BrowserToolKeysCommands.MemoryUsage,
        message: "ERR unknown command 'memory'",
      };
      when(mockStandaloneRedisClient.sendPipeline)
        .calledWith([
          [BrowserToolKeysCommands.Ttl, key],
          [BrowserToolKeysCommands.MemoryUsage, key, 'samples', '0'],
          [BrowserToolListCommands.LLen, key],
        ])
        .mockResolvedValue([
          [null, -1],
          [replyError, null],
          [null, 10],
        ]);

      const result = await strategy.getInfo(
        mockStandaloneRedisClient,
        key,
        RedisDataType.List,
      );

      expect(result).toEqual({ ...getKeyInfoResponse, size: null });
    });
  });
});
