import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import {
  mockStandaloneRedisClient,
} from 'src/__mocks__';
import {
  BrowserToolKeysCommands,
  BrowserToolSetCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { ReplyError } from 'src/models';
import { GetKeyInfoResponse, RedisDataType } from 'src/modules/browser/keys/dto';
import { SetKeyInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/set.key-info.strategy';

const getKeyInfoResponse: GetKeyInfoResponse = {
  name: 'testSet',
  type: 'set',
  ttl: -1,
  size: 50,
  length: 10,
};

describe('SetKeyInfoStrategy', () => {
  let strategy: SetKeyInfoStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SetKeyInfoStrategy,
      ],
    }).compile();

    strategy = module.get(SetKeyInfoStrategy);
  });

  describe('getInfo', () => {
    const key = getKeyInfoResponse.name;
    it('should return appropriate value', async () => {
      when(mockStandaloneRedisClient.sendPipeline)
        .calledWith([
          [BrowserToolKeysCommands.Ttl, key],
          [BrowserToolKeysCommands.MemoryUsage, key, 'samples', '0'],
          [BrowserToolSetCommands.SCard, key],
        ])
        .mockResolvedValue([
          [null, -1],
          [null, 50],
          [null, 10],
        ]);

      const result = await strategy.getInfo(
        mockStandaloneRedisClient,
        key,
        RedisDataType.Set,
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
          [BrowserToolSetCommands.SCard, key],
        ])
        .mockResolvedValue([
          [null, -1],
          [replyError, null],
          [null, 10],
        ]);

      const result = await strategy.getInfo(
        mockStandaloneRedisClient,
        key,
        RedisDataType.Set,
      );

      expect(result).toEqual({ ...getKeyInfoResponse, size: null });
    });
  });
});
