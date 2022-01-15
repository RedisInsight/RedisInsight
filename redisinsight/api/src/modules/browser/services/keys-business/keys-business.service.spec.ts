import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { when } from 'jest-when';
import { get } from 'lodash';
import { ReplyError } from 'src/models/redis-client';
import {
  mockBrowserAnalyticsService,
  mockOSSClusterDatabaseEntity,
  mockRedisClusterConsumer,
  mockRedisConsumer,
  mockRedisNoPermError,
  mockRepository,
  mockSettingsProvider,
  mockStandaloneDatabaseEntity,
} from 'src/__mocks__';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { IFindRedisClientInstanceByOptions } from 'src/modules/core/services/redis/redis.service';
import {
  GetKeyInfoResponse,
  GetKeysDto,
  GetKeysWithDetailsResponse,
  RedisDataType,
  RenameKeyDto,
} from 'src/modules/browser/dto';
import {
  ConnectionType,
  DatabaseInstanceEntity,
} from 'src/modules/core/models/database-instance.entity';
import { InstancesBusinessService } from 'src/modules/shared/services/instances-business/instances-business.service';
import { BrowserToolService } from 'src/modules/browser/services/browser-tool/browser-tool.service';
import { BrowserToolKeysCommands } from 'src/modules/browser/constants/browser-tool-commands';
import {
  BrowserToolClusterService,
} from 'src/modules/browser/services/browser-tool-cluster/browser-tool-cluster.service';
import { KeysBusinessService } from './keys-business.service';
import { StringTypeInfoStrategy } from './key-info-manager/strategies/string-type-info/string-type-info.strategy';
import { BrowserAnalyticsService } from '../browser-analytics/browser-analytics.service';

const getKeyInfoResponse: GetKeyInfoResponse = {
  name: 'testString',
  type: 'string',
  ttl: -1,
  size: 50,
};

const mockClientOptions: IFindRedisClientInstanceByOptions = {
  instanceId: mockStandaloneDatabaseEntity.id,
};

const mockGetKeysWithDetailsResponse: GetKeysWithDetailsResponse = {
  cursor: 0,
  total: 1,
  scanned: 0,
  keys: [getKeyInfoResponse],
};

describe('KeysBusinessService', () => {
  let service;
  let instancesBusinessService;
  let browserTool;
  let standaloneScanner;
  let clusterScanner;
  let stringTypeInfoManager;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KeysBusinessService,
        {
          provide: BrowserAnalyticsService,
          useFactory: mockBrowserAnalyticsService,
        },
        {
          provide: getRepositoryToken(DatabaseInstanceEntity),
          useFactory: mockRepository,
        },
        {
          provide: InstancesBusinessService,
          useFactory: () => ({
            getOneById: jest.fn(),
          }),
        },
        {
          provide: BrowserToolService,
          useFactory: mockRedisConsumer,
        },
        {
          provide: BrowserToolClusterService,
          useFactory: mockRedisClusterConsumer,
        },
        {
          provide: StringTypeInfoStrategy,
          useFactory: () => ({
            getInfo: jest.fn(),
          }),
        },
        {
          provide: 'SETTINGS_PROVIDER',
          useFactory: mockSettingsProvider,
        },
      ],
    }).compile();

    service = module.get<KeysBusinessService>(KeysBusinessService);
    instancesBusinessService = module.get<InstancesBusinessService>(
      InstancesBusinessService,
    );
    browserTool = module.get<BrowserToolService>(BrowserToolService);
    const scannerManager = get(service, 'scanner');
    const keyInfoManager = get(service, 'keyInfoManager');
    standaloneScanner = scannerManager.getStrategy(ConnectionType.STANDALONE);
    clusterScanner = scannerManager.getStrategy(ConnectionType.CLUSTER);
    stringTypeInfoManager = keyInfoManager.getStrategy(RedisDataType.String);
  });

  describe('getKeyInfo', () => {
    beforeEach(() => {
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolKeysCommands.Type, [
          getKeyInfoResponse.name,
        ])
        .mockResolvedValue(RedisDataType.String);
    });

    it('should return appropriate value', async () => {
      const mockResult: GetKeyInfoResponse = {
        ...getKeyInfoResponse,
        length: 10,
      };
      stringTypeInfoManager.getInfo = jest.fn().mockResolvedValue(mockResult);

      const result = await service.getKeyInfo(
        mockClientOptions,
        getKeyInfoResponse.name,
      );

      expect(result).toEqual(mockResult);
    });
    it('throw NotFound error when key not found for getKeyInfo', async () => {
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolKeysCommands.Type, [
          getKeyInfoResponse.name,
        ])
        .mockResolvedValue('none');

      await expect(
        service.getKeyInfo(mockClientOptions, getKeyInfoResponse.name),
      ).rejects.toThrow(NotFoundException);
    });
    it("user don't have required permissions for getKeyInfo", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'TYPE',
      };
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolKeysCommands.Type, [
          getKeyInfoResponse.name,
        ])
        .mockRejectedValue(replyError);

      await expect(
        service.getKeyInfo(mockClientOptions, getKeyInfoResponse.name),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getKeys', () => {
    const getKeysDto: GetKeysDto = { cursor: '0', count: 15 };
    beforeEach(() => {
      instancesBusinessService.getOneById.mockResolvedValue(
        mockStandaloneDatabaseEntity,
      );
    });
    it('should return appropriate value for standalone database', async () => {
      standaloneScanner.getKeys = jest
        .fn()
        .mockResolvedValue([mockGetKeysWithDetailsResponse]);

      const result = await service.getKeys(mockClientOptions, getKeysDto);

      expect(standaloneScanner.getKeys).toHaveBeenCalled();
      expect(result).toEqual([mockGetKeysWithDetailsResponse]);
    });
    it('should return appropriate value for cluster', async () => {
      const clientOptions: IFindRedisClientInstanceByOptions = {
        instanceId: mockOSSClusterDatabaseEntity.id,
      };
      instancesBusinessService.getOneById.mockResolvedValue(
        mockOSSClusterDatabaseEntity,
      );
      clusterScanner.getKeys = jest
        .fn()
        .mockResolvedValue([mockGetKeysWithDetailsResponse]);

      const result = await service.getKeys(clientOptions, getKeysDto);

      expect(clusterScanner.getKeys).toHaveBeenCalled();
      expect(result).toEqual([mockGetKeysWithDetailsResponse]);
    });
    it("user don't have required permissions for getKeys", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'SCAN',
      };
      standaloneScanner.getKeys = jest.fn().mockRejectedValue(replyError);

      await expect(
        service.getKeys(mockClientOptions, getKeysDto),
      ).rejects.toThrow(ForbiddenException);
    });
    it('scan per type not supported', async () => {
      const dto: GetKeysDto = {
        ...getKeysDto,
        type: RedisDataType.String,
      };
      const replyError: ReplyError = {
        name: 'ReplyError',
        message: 'ERR syntax error',
        command: 'SCAN',
      };
      standaloneScanner.getKeys = jest.fn().mockRejectedValue(replyError);

      try {
        await service.getKeys(mockClientOptions, dto);
        fail('Should throw an error');
      } catch (err) {
        expect(err).toBeInstanceOf(BadRequestException);
        expect(err.message).toEqual(
          ERROR_MESSAGES.SCAN_PER_DATA_TYPE_NOT_SUPPORT(),
        );
      }
    });
  });

  describe('deleteKeys', () => {
    const keyNames = ['testString1', 'testString2'];

    it('succeeded to delete keys', async () => {
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolKeysCommands.Del, [
          ...keyNames,
        ])
        .mockResolvedValue(keyNames.length);

      const result = await service.deleteKeys(mockClientOptions, [
        'testString1',
        'testString2',
      ]);
      expect(result).toEqual({ affected: keyNames.length });
    });
    it('keys not found', async () => {
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolKeysCommands.Del, [
          ...keyNames,
        ])
        .mockResolvedValue(null);

      await expect(
        service.deleteKeys(mockClientOptions, keyNames),
      ).rejects.toThrow(NotFoundException);
    });
    it("user don't have required permissions for deleteKeys", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'DEL',
      };
      browserTool.execCommand.mockRejectedValue(replyError);

      await expect(
        service.deleteKeys(mockClientOptions, keyNames),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('renameKey', () => {
    const renameKeyDto: RenameKeyDto = {
      keyName: 'testString1',
      newKeyName: 'testString2',
    };

    it('succeeded to rename key', async () => {
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolKeysCommands.Exists, [
          renameKeyDto.keyName,
        ])
        .mockResolvedValue(true);
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolKeysCommands.RenameNX, [
          renameKeyDto.keyName,
          renameKeyDto.newKeyName,
        ])
        .mockResolvedValue(1);

      await expect(
        service.renameKey(mockClientOptions, renameKeyDto),
      ).resolves.not.toThrow();
    });
    it('key with keyName not exist', async () => {
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolKeysCommands.Exists, [
          renameKeyDto.keyName,
        ])
        .mockResolvedValue(false);

      await expect(
        service.renameKey(mockClientOptions, renameKeyDto),
      ).rejects.toThrow(NotFoundException);
    });
    it('key with newKeyName already exists', async () => {
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolKeysCommands.Exists, [
          renameKeyDto.keyName,
        ])
        .mockResolvedValue(true);
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolKeysCommands.Exists, [
          renameKeyDto.keyName,
          renameKeyDto.newKeyName,
        ])
        .mockResolvedValue(0);

      await expect(
        service.renameKey(mockClientOptions, renameKeyDto),
      ).rejects.toThrow(BadRequestException);
    });
    it("user don't have required permissions for renameKey", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'RENAMENX',
      };
      browserTool.execCommand.mockRejectedValue(replyError);

      await expect(
        service.renameKey(mockClientOptions, renameKeyDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateTtl', () => {
    const keyName = 'testString';
    it('set expiration time', async () => {
      const dto = { keyName, ttl: 1000 };
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolKeysCommands.Ttl, [keyName])
        .mockResolvedValue(-1);
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolKeysCommands.Expire, [
          keyName,
          dto.ttl,
        ])
        .mockResolvedValue(1);

      const result = await service.updateTtl(mockClientOptions, dto);

      expect(result).toEqual({ ttl: dto.ttl });
    });
    it('remove the existing timeout on key', async () => {
      const dto = { keyName, ttl: -1 };
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolKeysCommands.Ttl, [keyName])
        .mockResolvedValue(1000);
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolKeysCommands.Persist, [
          keyName,
        ])
        .mockResolvedValue(1);

      const result = await service.updateTtl(mockClientOptions, dto);
      expect(result).toEqual({ ttl: dto.ttl });
    });
    it('key not found', async () => {
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolKeysCommands.Expire, [
          keyName,
        ])
        .mockResolvedValue(0);

      await expect(
        service.updateTtl(mockClientOptions, { keyName, ttl: 1000 }),
      ).rejects.toThrow(NotFoundException);
    });
    it("user don't have required permissions for updateTtl", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'EXPIRE',
      };
      browserTool.execCommand.mockRejectedValue(replyError);

      await expect(
        service.updateTtl(mockClientOptions, { keyName, ttl: 1000 }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('removeKeyExpiration', () => {
    const keyName = 'testString';
    it('should remove key expiration', async () => {
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolKeysCommands.Ttl, [keyName])
        .mockResolvedValue(1000);

      const result = await service.removeKeyExpiration(mockClientOptions, {
        keyName,
        ttl: -1,
      });
      expect(result).toEqual({ ttl: -1 });
      expect(browserTool.execCommand).toHaveBeenCalledWith(
        mockClientOptions,
        BrowserToolKeysCommands.Persist,
        [keyName],
      );
    });
    it('key not found', async () => {
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolKeysCommands.Ttl, [keyName])
        .mockResolvedValue(-2);

      await expect(
        service.removeKeyExpiration(mockClientOptions, { keyName, ttl: -1 }),
      ).rejects.toThrow(NotFoundException);
    });
    it("user don't have required permissions for removeKeyExpiration", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'TTL',
      };
      browserTool.execCommand.mockRejectedValue(replyError);

      await expect(
        service.removeKeyExpiration(mockClientOptions, { keyName, ttl: -1 }),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
