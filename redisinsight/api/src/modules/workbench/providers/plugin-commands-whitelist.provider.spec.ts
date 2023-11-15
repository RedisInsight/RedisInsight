import { Test, TestingModule } from '@nestjs/testing';
import Redis from 'ioredis';
import {
  mockRedisCommandReply,
  mockWhitelistCommandsResponse, mockStandaloneRedisClient,
} from 'src/__mocks__';
import { PluginCommandsWhitelistProvider } from 'src/modules/workbench/providers/plugin-commands-whitelist.provider';

const mockClient = Object.create(Redis.prototype);

const mockRedisTool = {
  getRedisClient: jest.fn(),
};

describe('PluginCommandsWhitelistProvider', () => {
  const client = mockStandaloneRedisClient;
  let service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PluginCommandsWhitelistProvider,
      ],
    }).compile();

    service = await module.get<PluginCommandsWhitelistProvider>(PluginCommandsWhitelistProvider);
    mockRedisTool.getRedisClient.mockResolvedValue(mockClient);
    mockClient.call = jest.fn();
  });

  describe('getWhitelistCommands', () => {
    let calculateCommandsSpy;

    beforeEach(() => {
      calculateCommandsSpy = jest.spyOn(service, 'calculateWhiteListCommands');
    });

    it('should fetch commands when no cache and return from cache when possible', async () => {
      calculateCommandsSpy.mockResolvedValueOnce(mockWhitelistCommandsResponse);

      expect(
        await service.getWhitelistCommands(client),
      ).toEqual(mockWhitelistCommandsResponse);
      expect(calculateCommandsSpy).toHaveBeenCalled();

      calculateCommandsSpy.mockClear();

      expect(
        await service.getWhitelistCommands(client),
      ).toEqual(mockWhitelistCommandsResponse);
      expect(calculateCommandsSpy).not.toHaveBeenCalled();
    });
  });
  describe('calculateWhiteListCommands', () => {
    it('should return 2 readonly commands', async () => {
      mockClient.call.mockResolvedValueOnce(mockRedisCommandReply);
      mockClient.call.mockResolvedValueOnce([]);
      mockClient.call.mockResolvedValueOnce([]);

      const result = await service.calculateWhiteListCommands(mockClient);

      expect(result).toEqual(mockWhitelistCommandsResponse);
    });
    it('should return 1 readonly commands excluded by dangerous filter', async () => {
      mockClient.call.mockResolvedValueOnce(mockRedisCommandReply);
      mockClient.call.mockResolvedValueOnce(['custom.command']);
      mockClient.call.mockResolvedValueOnce([]);

      const result = await service.calculateWhiteListCommands(mockClient);

      expect(result).toEqual(['get']);
    });
    it('should return 1 readonly commands excluded by blocking filter', async () => {
      mockClient.call.mockResolvedValueOnce(mockRedisCommandReply);
      mockClient.call.mockResolvedValueOnce([]);
      mockClient.call.mockResolvedValueOnce(['custom.command']);

      const result = await service.calculateWhiteListCommands(mockClient);

      expect(result).toEqual(['get']);
    });
  });
});
