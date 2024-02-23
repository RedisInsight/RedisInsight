import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import {
  mockStandaloneRedisClient,
} from 'src/__mocks__';
import {
  BrowserToolHashCommands,
  BrowserToolKeysCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { ReplyError } from 'src/models';
import { GetKeyInfoResponse, RedisDataType } from 'src/modules/browser/keys/dto';
import { HashKeyInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/hash.key-info.strategy';

const getKeyInfoResponse: GetKeyInfoResponse = {
  name: 'testHash',
  type: 'hash',
  ttl: -1,
  size: 50,
  length: 10,
};

describe('HashKeyInfoStrategy', () => {
  let strategy: HashKeyInfoStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HashKeyInfoStrategy,
      ],
    }).compile();

    strategy = module.get(HashKeyInfoStrategy);
  });

  describe('getInfo', () => {
    const key = getKeyInfoResponse.name;
    it('should return appropriate value', async () => {
      when(mockStandaloneRedisClient.sendPipeline)
        .calledWith([
          [BrowserToolKeysCommands.Ttl, key],
          [BrowserToolKeysCommands.MemoryUsage, key, 'samples', '0'],
          [BrowserToolHashCommands.HLen, key],
        ])
        .mockResolvedValue([
          [null, -1],
          [null, 50],
          [null, 10],
        ]);

      const result = await strategy.getInfo(
        mockStandaloneRedisClient,
        key,
        RedisDataType.Hash,
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
          [BrowserToolHashCommands.HLen, key],
        ])
        .mockResolvedValue([
          [null, -1],
          [replyError, null],
          [null, 10],
        ]);

      const result = await strategy.getInfo(
        mockStandaloneRedisClient,
        key,
        RedisDataType.Hash,
      );

      expect(result).toEqual({ ...getKeyInfoResponse, size: null });
    });
  });
});
