import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import {
  mockRedisConsumer,
  mockRedisWrongTypeError,
  mockSettingsProvider,
  mockStandaloneDatabaseEntity,
} from 'src/__mocks__';
import { ReplyError } from 'src/models';
import { GetKeyInfoResponse, RedisDataType } from 'src/modules/browser/dto';
import { BrowserToolService } from 'src/modules/browser/services/browser-tool/browser-tool.service';
import { IFindRedisClientInstanceByOptions } from 'src/modules/core/services/redis/redis.service';
import { BrowserToolKeysCommands } from 'src/modules/browser/constants/browser-tool-commands';
import { StandaloneStrategy } from 'src/modules/browser/services/keys-business/scanner/strategies/standalone.strategy';
import { AbstractStrategy } from 'src/modules/browser/services/keys-business/scanner/strategies/abstract.strategy';
import { ISettingsProvider } from 'src/modules/core/models/settings-provider.interface';
import * as Redis from 'ioredis';

const mockClientOptions: IFindRedisClientInstanceByOptions = {
  instanceId: mockStandaloneDatabaseEntity.id,
};

const nodeClient = Object.create(Redis.prototype);

const mockKeyInfo: GetKeyInfoResponse = {
  name: 'testString',
  type: 'string',
  ttl: -1,
  size: 50,
};

describe('RedisScannerAbstract', () => {
  let scannerInstance: AbstractStrategy;
  let browserTool: BrowserToolService;
  let settingsProvider: ISettingsProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: BrowserToolService,
          useFactory: mockRedisConsumer,
        },
        {
          provide: 'SETTINGS_PROVIDER',
          useFactory: mockSettingsProvider,
        },
      ],
    }).compile();

    browserTool = await module.get<BrowserToolService>(BrowserToolService);
    settingsProvider = module.get<ISettingsProvider>('SETTINGS_PROVIDER');
    scannerInstance = new StandaloneStrategy(browserTool, settingsProvider);
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
    });
    it('should return correct keys info', async () => {
      const mockResult: GetKeyInfoResponse[] = keys.map((key) => ({
        ...mockKeyInfo,
        name: key,
      }));

      const result = await scannerInstance.getKeysInfo(nodeClient, keys);

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
        mockClientOptions,
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
