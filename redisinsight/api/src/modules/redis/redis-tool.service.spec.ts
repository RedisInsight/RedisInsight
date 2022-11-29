import { Test, TestingModule } from '@nestjs/testing';
import * as Redis from 'ioredis-mock';
import { mockDatabase, mockDatabaseService } from 'src/__mocks__';
import { IFindRedisClientInstanceByOptions, RedisService } from 'src/modules/redis/redis.service';
import { BrowserToolKeysCommands } from 'src/modules/browser/constants/browser-tool-commands';
import { InternalServerErrorException } from '@nestjs/common';
import { RedisToolService } from 'src/modules/redis/redis-tool.service';
import { DatabaseService } from 'src/modules/database/database.service';

const mockClientOptions: IFindRedisClientInstanceByOptions = {
  instanceId: mockDatabase.id,
};

const mockClient = new Redis();

describe('CliToolService', () => {
  let service: RedisToolService;
  let getRedisClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisToolService,
        {
          provide: RedisService,
          useFactory: () => ({}),
        },
        {
          provide: DatabaseService,
          useFactory: mockDatabaseService,
        },
      ],
    }).compile();

    service = await module.get<RedisToolService>(RedisToolService);
    getRedisClient = jest.spyOn<RedisToolService, any>(service, 'getRedisClient');
    mockClient.sendCommand = jest.fn();
  });

  describe('execCommand', () => {
    const keyName = 'keyName';
    it('should call sendCommand with correct args', async () => {
      getRedisClient.mockResolvedValue(mockClient);

      await service.execCommand(
        mockClientOptions,
        BrowserToolKeysCommands.MemoryUsage,
        [keyName],
      );

      expect(mockClient.sendCommand).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'memory', args: ['usage', keyName] }),
      );
    });
    it('should throw error', async () => {
      const error = new InternalServerErrorException(
        ' Could not connect to localhost, please check the connection details.',
      );
      getRedisClient.mockRejectedValue(error);

      await expect(
        service.execCommand(
          mockClientOptions,
          BrowserToolKeysCommands.MemoryUsage,
          [keyName],
        ),
      ).rejects.toThrow(InternalServerErrorException);
      expect(mockClient.sendCommand).not.toHaveBeenCalled();
    });
  });
});
