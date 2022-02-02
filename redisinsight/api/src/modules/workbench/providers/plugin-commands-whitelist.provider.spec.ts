import { Test, TestingModule } from '@nestjs/testing';
import * as Redis from 'ioredis';
import {
  mockRedisCommandReply,
  mockStandaloneDatabaseEntity,
  mockWhitelistCommandsResponse,
} from 'src/__mocks__';
import { PluginCommandsWhitelistProvider } from 'src/modules/workbench/providers/plugin-commands-whitelist.provider';
import { RedisToolService } from 'src/modules/shared/services/base/redis-tool.service';

const mockClient = Object.create(Redis.prototype);

const mockRedisTool = {
  getRedisClient: jest.fn(),
};

describe('PluginCommandsWhitelistProvider', () => {
  let service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PluginCommandsWhitelistProvider,
        {
          provide: RedisToolService,
          useFactory: () => mockRedisTool,
        },
      ],
    }).compile();

    service = await module.get<PluginCommandsWhitelistProvider>(PluginCommandsWhitelistProvider);
    mockRedisTool.getRedisClient.mockResolvedValue(mockClient);
    mockClient.send_command = jest.fn();
  });

  describe('getWhitelistCommands', () => {
    let calculateCommandsSpy;

    beforeEach(() => {
      calculateCommandsSpy = jest.spyOn(service, 'calculateWhiteListCommands');
    });

    it('should fetch commands when no cache and return from cache when possible', async () => {
      calculateCommandsSpy.mockResolvedValueOnce(mockWhitelistCommandsResponse);

      expect(
        await service.getWhitelistCommands(mockStandaloneDatabaseEntity.id),
      ).toEqual(mockWhitelistCommandsResponse);
      expect(calculateCommandsSpy).toHaveBeenCalled();

      calculateCommandsSpy.mockClear();

      expect(
        await service.getWhitelistCommands(mockStandaloneDatabaseEntity.id),
      ).toEqual(mockWhitelistCommandsResponse);
      expect(calculateCommandsSpy).not.toHaveBeenCalled();
    });
  });
  describe('calculateWhiteListCommands', () => {
    it('should return 2 readonly commands', async () => {
      mockClient.send_command.mockResolvedValueOnce(mockRedisCommandReply);
      mockClient.send_command.mockResolvedValueOnce([]);
      mockClient.send_command.mockResolvedValueOnce([]);

      const result = await service.calculateWhiteListCommands(mockClient);

      expect(result).toEqual(mockWhitelistCommandsResponse);
    });
    it('should return 1 readonly commands excluded by dangerous filter', async () => {
      mockClient.send_command.mockResolvedValueOnce(mockRedisCommandReply);
      mockClient.send_command.mockResolvedValueOnce(['custom.command']);
      mockClient.send_command.mockResolvedValueOnce([]);

      const result = await service.calculateWhiteListCommands(mockClient);

      expect(result).toEqual(['get']);
    });
    it('should return 1 readonly commands excluded by blocking filter', async () => {
      mockClient.send_command.mockResolvedValueOnce(mockRedisCommandReply);
      mockClient.send_command.mockResolvedValueOnce([]);
      mockClient.send_command.mockResolvedValueOnce(['custom.command']);

      const result = await service.calculateWhiteListCommands(mockClient);

      expect(result).toEqual(['get']);
    });
  });
});
