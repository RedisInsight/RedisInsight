import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import {
  mockStandaloneRedisClient,
} from 'src/__mocks__';
import { ReplyError } from 'src/models';
import {
  BrowserToolKeysCommands,
  BrowserToolZSetCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { GetKeyInfoResponse, RedisDataType } from 'src/modules/browser/keys/dto';
import { ZSetKeyInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/z-set.key-info.strategy';

const getKeyInfoResponse: GetKeyInfoResponse = {
  name: 'testZSet',
  type: 'zset',
  ttl: -1,
  size: 50,
  length: 10,
};

describe('ZSetKeyInfoStrategy', () => {
  let strategy: ZSetKeyInfoStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ZSetKeyInfoStrategy,
      ],
    }).compile();

    strategy = module.get(ZSetKeyInfoStrategy);
  });

  describe('getInfo', () => {
    const key = getKeyInfoResponse.name;
    it('should return appropriate value', async () => {
      when(mockStandaloneRedisClient.sendPipeline)
        .calledWith([
          [BrowserToolKeysCommands.Ttl, key],
          [BrowserToolKeysCommands.MemoryUsage, key, 'samples', '0'],
          [BrowserToolZSetCommands.ZCard, key],
        ])
        .mockResolvedValue([
          [null, -1],
          [null, 50],
          [null, 10],
        ]);

      const result = await strategy.getInfo(
        mockStandaloneRedisClient,
        key,
        RedisDataType.ZSet,
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
          [BrowserToolZSetCommands.ZCard, key],
        ])
        .mockResolvedValue([
          [null, -1],
          [replyError, null],
          [null, 10],
        ]);

      const result = await strategy.getInfo(
        mockStandaloneRedisClient,
        key,
        RedisDataType.ZSet,
      );

      expect(result).toEqual({ ...getKeyInfoResponse, size: null });
    });
  });
});
