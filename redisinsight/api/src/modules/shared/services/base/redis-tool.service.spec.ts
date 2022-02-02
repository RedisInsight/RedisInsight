import { Test, TestingModule } from '@nestjs/testing';
import * as Redis from 'ioredis-mock';
import { mockStandaloneDatabaseEntity } from 'src/__mocks__';
import { IFindRedisClientInstanceByOptions, RedisService } from 'src/modules/core/services/redis/redis.service';
import { InstancesBusinessService } from 'src/modules/shared/services/instances-business/instances-business.service';
import { BrowserToolKeysCommands } from 'src/modules/browser/constants/browser-tool-commands';
import { InternalServerErrorException } from '@nestjs/common';
import { RedisToolService } from 'src/modules/shared/services/base/redis-tool.service';

const mockClientOptions: IFindRedisClientInstanceByOptions = {
  instanceId: mockStandaloneDatabaseEntity.id,
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
          provide: InstancesBusinessService,
          useFactory: () => ({}),
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
