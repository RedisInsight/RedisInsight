import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import {
  mockBrowserClientMetadata,
  mockRedisConsumer,
  mockRedisWrongTypeError,
  mockSettingsService,
} from 'src/__mocks__';
import { ReplyError } from 'src/models';
import { GetKeyInfoResponse, RedisDataType } from 'src/modules/browser/keys/dto';
import { BrowserToolService } from 'src/modules/browser/services/browser-tool/browser-tool.service';
import { BrowserToolKeysCommands } from 'src/modules/browser/constants/browser-tool-commands';
import { StandaloneStrategy, AbstractStrategy } from 'src/modules/browser/keys/strategies';
import IORedis from 'ioredis';
import { SettingsService } from 'src/modules/settings/settings.service';

const nodeClient = Object.create(IORedis.prototype);

const clusterClient = Object.create(IORedis.Cluster.prototype);
clusterClient.isCluster = true;
clusterClient.sendCommand = jest.fn();

const mockKeyInfo: GetKeyInfoResponse = {
  name: 'testString',
  type: 'string',
  ttl: -1,
  size: 50,
};

describe('RedisScannerAbstract', () => {
  let scannerInstance: AbstractStrategy;
  let browserTool: BrowserToolService;
  let settingsService: SettingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: BrowserToolService,
          useFactory: mockRedisConsumer,
        },
        {
          provide: SettingsService,
          useFactory: mockSettingsService,
        },
      ],
    }).compile();

    browserTool = await module.get<BrowserToolService>(BrowserToolService);
    settingsService = module.get(SettingsService);
    scannerInstance = new StandaloneStrategy(browserTool, settingsService);
  });

  describe('getKeysInfo', () => {
    const keys = ['key1', 'key2'];
    beforeEach(() => {
      when(browserTool.execPipelineFromClient)
        .calledWith(
          nodeClient,
          keys.map((key: string) => [BrowserToolKeysCommands.Ttl, key]),
        )
        .mockResolvedValue([null, Array(keys.length).fill([null, -1])]);
      when(browserTool.execPipelineFromClient)
        .calledWith(nodeClient, [
          ...keys.map((key: string) => [
            BrowserToolKeysCommands.MemoryUsage,
            key,
            'samples',
            '0',
          ]),
        ])
        .mockResolvedValue([
          null,
          Array(keys.length).fill([null, 50]),
        ]);
      when(browserTool.execPipelineFromClient)
        .calledWith(
          nodeClient,
          keys.map((key: string) => [BrowserToolKeysCommands.Type, key]),
        )
        .mockResolvedValue([null, Array(keys.length).fill([null, 'string'])]);
      when(clusterClient.sendCommand)
        .calledWith(jasmine.objectContaining({ name: 'type' }))
        .mockResolvedValue('string')
        .calledWith(jasmine.objectContaining({ name: 'ttl' }))
        .mockResolvedValue(-1)
        .calledWith(jasmine.objectContaining({ name: 'memory' }))
        .mockResolvedValue(50);
    });
    it('should return correct keys info', async () => {
      const mockResult: GetKeyInfoResponse[] = keys.map((key) => ({
        ...mockKeyInfo,
        name: key,
      }));

      const result = await scannerInstance.getKeysInfo(nodeClient, keys);

      expect(result).toEqual(mockResult);
    });
    it('should return correct keys info (cluster)', async () => {
      const mockResult: GetKeyInfoResponse[] = keys.map((key) => ({
        ...mockKeyInfo,
        name: key,
      }));

      const result = await scannerInstance.getKeysInfo(clusterClient, keys);

      expect(result).toEqual(mockResult);
    });
    it('should not call TYPE pipeline for keys with known type', async () => {
      const mockResult: GetKeyInfoResponse[] = keys.map((key) => ({
        ...mockKeyInfo,
        name: key,
      }));

      const result = await scannerInstance.getKeysInfo(
        nodeClient,
        keys,
        RedisDataType.String,
      );

      expect(result).toEqual(mockResult);
      expect(browserTool.execPipeline).not.toHaveBeenCalledWith(
        mockBrowserClientMetadata,
        keys.map((key: string) => [BrowserToolKeysCommands.Type, key]),
      );
    });
    it('should throw transaction error for SIZE', async () => {
      const transactionError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: BrowserToolKeysCommands.MemoryUsage,
      };
      when(browserTool.execPipelineFromClient)
        .calledWith(nodeClient, [
          ...keys.map((key: string) => [
            BrowserToolKeysCommands.MemoryUsage,
            key,
            'samples',
            '0',
          ]),
        ])
        .mockResolvedValue([transactionError, null]);

      await expect(
        scannerInstance.getKeysInfo(nodeClient, keys),
      ).rejects.toEqual(transactionError);
    });
    it('should throw transaction error for Type', async () => {
      const transactionError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: BrowserToolKeysCommands.Type,
      };
      when(browserTool.execPipelineFromClient)
        .calledWith(
          nodeClient,
          keys.map((key: string) => [BrowserToolKeysCommands.Type, key]),
        )
        .mockResolvedValue([transactionError, null]);

      await expect(
        scannerInstance.getKeysInfo(nodeClient, keys),
      ).rejects.toEqual(transactionError);
    });
    it('should throw transaction error for TTL', async () => {
      const transactionError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: BrowserToolKeysCommands.Ttl,
      };
      when(browserTool.execPipelineFromClient)
        .calledWith(
          nodeClient,
          keys.map((key: string) => [BrowserToolKeysCommands.Ttl, key]),
        )
        .mockResolvedValue([transactionError, null]);

      await expect(
        scannerInstance.getKeysInfo(nodeClient, keys),
      ).rejects.toEqual(transactionError);
    });
  });
});
