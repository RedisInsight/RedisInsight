import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import {
  mockStandaloneRedisClient,
} from 'src/__mocks__';
import { ReplyError } from 'src/models';
import {
  BrowserToolKeysCommands,
  BrowserToolRejsonRlCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { GetKeyInfoResponse, RedisDataType } from 'src/modules/browser/keys/dto';
import { mockKeyDto } from 'src/modules/browser/__mocks__';
import { RejsonRlKeyInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/rejson-rl.key-info.strategy';

const getKeyInfoResponse: GetKeyInfoResponse = {
  name: mockKeyDto.keyName,
  type: 'ReJSON-RL',
  ttl: -1,
  size: 50,
  length: 10,
};

describe('RejsonRlKeyInfoStrategy', () => {
  let strategy: RejsonRlKeyInfoStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RejsonRlKeyInfoStrategy,
      ],
    }).compile();

    strategy = module.get(RejsonRlKeyInfoStrategy);
  });

  describe('getInfo', () => {
    const key = getKeyInfoResponse.name;
    const path = '.';
    beforeEach(() => {
      when(mockStandaloneRedisClient.sendPipeline)
        .calledWith([
          [BrowserToolKeysCommands.Ttl, key],
          [BrowserToolKeysCommands.MemoryUsage, key, 'samples', '0'],
        ])
        .mockResolvedValue([
          [null, -1],
          [null, 50],
        ]);
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith(
          [BrowserToolRejsonRlCommands.JsonType, key, path],
          { replyEncoding: 'utf8' },
        )
        .mockResolvedValue('object');
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith(
          [BrowserToolRejsonRlCommands.JsonObjLen, key, path],
          { replyEncoding: 'utf8' },
        )
        .mockResolvedValue(10);
    });
    it('should return appropriate value for key that store object', async () => {
      const result = await strategy.getInfo(
        mockStandaloneRedisClient,
        key,
        RedisDataType.JSON,
      );

      expect(result).toEqual(getKeyInfoResponse);
    });
    it('should return appropriate value for key that store string', async () => {
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith(
          [BrowserToolRejsonRlCommands.JsonType, key, path],
          { replyEncoding: 'utf8' },
        )
        .mockResolvedValue('string');
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith(
          [BrowserToolRejsonRlCommands.JsonStrLen, key, path],
          { replyEncoding: 'utf8' },
        )
        .mockResolvedValue(10);

      const result = await strategy.getInfo(
        mockStandaloneRedisClient,
        key,
        RedisDataType.JSON,
      );

      expect(result).toEqual(getKeyInfoResponse);
    });
    it('should return appropriate value for key that store array', async () => {
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith(
          [BrowserToolRejsonRlCommands.JsonType, key, path],
          { replyEncoding: 'utf8' },
        )
        .mockResolvedValue('array');
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith(
          [BrowserToolRejsonRlCommands.JsonArrLen, key, path],
          { replyEncoding: 'utf8' },
        )
        .mockResolvedValue(10);

      const result = await strategy.getInfo(
        mockStandaloneRedisClient,
        key,
        RedisDataType.JSON,
      );

      expect(result).toEqual(getKeyInfoResponse);
    });
    it('should return appropriate value for key that store not iterable type', async () => {
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith(
          [BrowserToolRejsonRlCommands.JsonType, key, path],
          { replyEncoding: 'utf8' },
        )
        .mockResolvedValue('boolean');

      const result = await strategy.getInfo(
        mockStandaloneRedisClient,
        key,
        RedisDataType.JSON,
      );

      expect(result).toEqual({ ...getKeyInfoResponse, length: null });
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
        ])
        .mockResolvedValue([
          [null, -1],
          [replyError, null],
        ]);

      const result = await strategy.getInfo(
        mockStandaloneRedisClient,
        key,
        RedisDataType.JSON,
      );

      expect(result).toEqual({ ...getKeyInfoResponse, size: null });
    });
  });
});
