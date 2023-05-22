import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { when } from 'jest-when';
import { get } from 'lodash';
import { ReplyError } from 'src/models/redis-client';
import {
  mockRedisClusterConsumer,
  mockRedisConsumer,
  mockRedisNoPermError,
  mockSettingsService,
  mockClusterDatabaseWithTlsAuth,
  mockDatabaseService,
  MockType,
  mockBrowserClientMetadata,
  mockBrowserHistoryService,
  mockDatabaseRecommendationService,
} from 'src/__mocks__';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { RECOMMENDATION_NAMES } from 'src/constants';
import {
  GetKeyInfoResponse,
  GetKeysDto,
  GetKeysWithDetailsResponse,
  RedisDataType,
  RenameKeyDto,
} from 'src/modules/browser/dto';
import { BrowserToolService } from 'src/modules/browser/services/browser-tool/browser-tool.service';
import { BrowserToolKeysCommands } from 'src/modules/browser/constants/browser-tool-commands';
import {
  BrowserToolClusterService,
} from 'src/modules/browser/services/browser-tool-cluster/browser-tool-cluster.service';
import { SettingsService } from 'src/modules/settings/settings.service';
import { DatabaseRecommendationService } from 'src/modules/database-recommendation/database-recommendation.service';
import IORedis from 'ioredis';
import { ConnectionType } from 'src/modules/database/entities/database.entity';
import { DatabaseService } from 'src/modules/database/database.service';
import { KeysBusinessService } from './keys-business.service';
import { StringTypeInfoStrategy } from './key-info-manager/strategies/string-type-info/string-type-info.strategy';
import { BrowserHistoryService } from '../browser-history/browser-history.service';

const getKeyInfoResponse: GetKeyInfoResponse = {
  name: Buffer.from('testString'),
  type: 'string',
  ttl: -1,
  size: 50,
};

const mockGetKeysWithDetailsResponse: GetKeysWithDetailsResponse = {
  cursor: 0,
  total: 1,
  scanned: 0,
  keys: [getKeyInfoResponse],
};

const nodeClient = Object.create(IORedis.prototype);
nodeClient.isCluster = false;

describe('KeysBusinessService', () => {
  let service: KeysBusinessService;
  let databaseService: MockType<DatabaseService>;
  let browserTool;
  let standaloneScanner;
  let clusterScanner;
  let stringTypeInfoManager;
  let browserHistory;
  let recommendationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KeysBusinessService,
        // {
        //   provide: DatabaseRepository,
        //   useFactory: mockRepository,
        // },
        {
          provide: DatabaseService,
          useFactory: mockDatabaseService,
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
          provide: SettingsService,
          useFactory: mockSettingsService,
        },
        {
          provide: BrowserHistoryService,
          useFactory: mockBrowserHistoryService,
        },
        {
          provide: DatabaseRecommendationService,
          useFactory: mockDatabaseRecommendationService,
        },
      ],
    }).compile();

    service = module.get<KeysBusinessService>(KeysBusinessService);
    databaseService = module.get(DatabaseService);
    recommendationService = module.get<DatabaseRecommendationService>(DatabaseRecommendationService);
    browserTool = module.get<BrowserToolService>(BrowserToolService);
    browserHistory = module.get<BrowserHistoryService>(BrowserHistoryService);
    const scannerManager: any = get(service, 'scanner');
    const keyInfoManager: any = get(service, 'keyInfoManager');
    standaloneScanner = scannerManager.getStrategy(ConnectionType.STANDALONE);
    clusterScanner = scannerManager.getStrategy(ConnectionType.CLUSTER);
    stringTypeInfoManager = keyInfoManager.getStrategy(RedisDataType.String);
  });

  describe('getKeyInfo', () => {
    beforeEach(() => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Type, [
          getKeyInfoResponse.name,
        ], 'utf8')
        .mockResolvedValue(RedisDataType.String);
    });

    it('should return appropriate value', async () => {
      const mockResult: GetKeyInfoResponse = {
        ...getKeyInfoResponse,
        length: 10,
      };
      stringTypeInfoManager.getInfo = jest.fn().mockResolvedValue(mockResult);

      const result = await service.getKeyInfo(
        mockBrowserClientMetadata,
        getKeyInfoResponse.name,
      );

      expect(result).toEqual(mockResult);
    });
    it('throw NotFound error when key not found for getKeyInfo', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Type, [
          getKeyInfoResponse.name,
        ], 'utf8')
        .mockResolvedValue('none');

      await expect(
        service.getKeyInfo(mockBrowserClientMetadata, getKeyInfoResponse.name),
      ).rejects.toThrow(NotFoundException);
    });
    it("user don't have required permissions for getKeyInfo", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'TYPE',
      };
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Type, [
          getKeyInfoResponse.name,
        ], 'utf8')
        .mockRejectedValue(replyError);

      await expect(
        service.getKeyInfo(mockBrowserClientMetadata, getKeyInfoResponse.name),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should call recommendationService', async () => {
      const mockResult: GetKeyInfoResponse = {
        ...getKeyInfoResponse,
        length: 10,
      };
      stringTypeInfoManager.getInfo = jest.fn().mockResolvedValue(mockResult);

      const result = await service.getKeyInfo(
        mockBrowserClientMetadata,
        getKeyInfoResponse.name,
      );

      expect(recommendationService.check).toBeCalledWith(
        mockBrowserClientMetadata,
        RECOMMENDATION_NAMES.BIG_SETS,
        result,
      );
      expect(recommendationService.check).toBeCalledWith(
        mockBrowserClientMetadata,
        RECOMMENDATION_NAMES.BIG_STRINGS,
        result,
      );
      expect(recommendationService.check).toBeCalledWith(
        mockBrowserClientMetadata,
        RECOMMENDATION_NAMES.COMPRESSION_FOR_LIST,
        result,
      );
    });
  });

  describe('getKeysInfo', () => {
    beforeEach(() => {
      when(browserTool.getRedisClient)
        .calledWith(mockBrowserClientMetadata)
        .mockResolvedValue(nodeClient);
      standaloneScanner['getKeysInfo'] = jest.fn().mockResolvedValue([getKeyInfoResponse]);
    });

    it('should return keys with info', async () => {
      const result = await service.getKeysInfo(
        mockBrowserClientMetadata,
        { keys: [getKeyInfoResponse.name] },
      );

      expect(result).toEqual([getKeyInfoResponse]);
    });
    it('should call recommendationService', async () => {
      const result = await service.getKeysInfo(
        mockBrowserClientMetadata,
        { keys: [getKeyInfoResponse.name] },
      );

      expect(recommendationService.check).toBeCalledWith(
        mockBrowserClientMetadata,
        RECOMMENDATION_NAMES.SEARCH_JSON,
        { keys: result, client: nodeClient, databaseId: mockBrowserClientMetadata.databaseId },
      );
      expect(recommendationService.check).toBeCalledTimes(1);
    });
    it("user don't have required permissions for getKeyInfo", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'TYPE',
      };

      standaloneScanner['getKeysInfo'] = jest.fn().mockRejectedValueOnce(replyError);

      await expect(
        service.getKeysInfo(mockBrowserClientMetadata, { keys: [getKeyInfoResponse.name] }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getKeys', () => {
    const getKeysDto: GetKeysDto = { cursor: '0', count: 15 };
    it('should return appropriate value for standalone database', async () => {
      standaloneScanner.getKeys = jest
        .fn()
        .mockResolvedValue([mockGetKeysWithDetailsResponse]);

      const result = await service.getKeys(mockBrowserClientMetadata, getKeysDto);

      expect(standaloneScanner.getKeys).toHaveBeenCalled();
      expect(result).toEqual([mockGetKeysWithDetailsResponse]);
    });
    it('should return appropriate value for cluster', async () => {
      databaseService.get.mockResolvedValueOnce(mockClusterDatabaseWithTlsAuth);
      clusterScanner.getKeys = jest
        .fn()
        .mockResolvedValue([mockGetKeysWithDetailsResponse]);

      const result = await service.getKeys(mockBrowserClientMetadata, getKeysDto);

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
        service.getKeys(mockBrowserClientMetadata, getKeysDto),
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
        await service.getKeys(mockBrowserClientMetadata, dto);
        fail('Should throw an error');
      } catch (err) {
        expect(err).toBeInstanceOf(BadRequestException);
        expect(err.message).toEqual(
          ERROR_MESSAGES.SCAN_PER_KEY_TYPE_NOT_SUPPORT(),
        );
      }
    });
    it('should call create browser history item if match !== "*"', async () => {
      standaloneScanner.getKeys = jest
        .fn()
        .mockResolvedValue([mockGetKeysWithDetailsResponse]);

      await service.getKeys(mockBrowserClientMetadata, { ...getKeysDto, match: '1' });

      expect(standaloneScanner.getKeys).toHaveBeenCalled();
      expect(browserHistory.create).toHaveBeenCalled();
    });
    it('should do not call create browser history item if match === "*"', async () => {
      standaloneScanner.getKeys = jest
        .fn()
        .mockResolvedValue([mockGetKeysWithDetailsResponse]);

      await service.getKeys(mockBrowserClientMetadata, { ...getKeysDto, match: '*' });

      expect(standaloneScanner.getKeys).toHaveBeenCalled();
      expect(browserHistory.create).not.toHaveBeenCalled();
    });
    it('should call recommendationService', async () => {
      const response = [mockGetKeysWithDetailsResponse]
      standaloneScanner.getKeys = jest
        .fn()
        .mockResolvedValue(response);

      await service.getKeys(mockBrowserClientMetadata, { ...getKeysDto, match: '*' });

      expect(recommendationService.check).toBeCalledWith(
        mockBrowserClientMetadata,
        RECOMMENDATION_NAMES.USE_SMALLER_KEYS,
        response[0].total,
      );
    });
  });

  describe('deleteKeys', () => {
    const keyNames = ['testString1', 'testString2'];

    it('succeeded to delete keys', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Del, [
          ...keyNames,
        ])
        .mockResolvedValue(keyNames.length);

      const result = await service.deleteKeys(mockBrowserClientMetadata, [
        'testString1',
        'testString2',
      ]);
      expect(result).toEqual({ affected: keyNames.length });
    });
    it('keys not found', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Del, [
          ...keyNames,
        ])
        .mockResolvedValue(null);

      await expect(
        service.deleteKeys(mockBrowserClientMetadata, keyNames),
      ).rejects.toThrow(NotFoundException);
    });
    it("user don't have required permissions for deleteKeys", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'DEL',
      };
      browserTool.execCommand.mockRejectedValue(replyError);

      await expect(
        service.deleteKeys(mockBrowserClientMetadata, keyNames),
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
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Exists, [
          renameKeyDto.keyName,
        ])
        .mockResolvedValue(true);
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.RenameNX, [
          renameKeyDto.keyName,
          renameKeyDto.newKeyName,
        ])
        .mockResolvedValue(1);

      await expect(
        service.renameKey(mockBrowserClientMetadata, renameKeyDto),
      ).resolves.not.toThrow();
    });
    it('key with keyName not exist', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Exists, [
          renameKeyDto.keyName,
        ])
        .mockResolvedValue(false);

      await expect(
        service.renameKey(mockBrowserClientMetadata, renameKeyDto),
      ).rejects.toThrow(NotFoundException);
    });
    it('key with newKeyName already exists', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Exists, [
          renameKeyDto.keyName,
        ])
        .mockResolvedValue(true);
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Exists, [
          renameKeyDto.keyName,
          renameKeyDto.newKeyName,
        ])
        .mockResolvedValue(0);

      await expect(
        service.renameKey(mockBrowserClientMetadata, renameKeyDto),
      ).rejects.toThrow(BadRequestException);
    });
    it("user don't have required permissions for renameKey", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'RENAMENX',
      };
      browserTool.execCommand.mockRejectedValue(replyError);

      await expect(
        service.renameKey(mockBrowserClientMetadata, renameKeyDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateTtl', () => {
    const keyName = 'testString';
    it('set expiration time', async () => {
      const dto = { keyName, ttl: 1000 };
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Ttl, [keyName])
        .mockResolvedValue(-1);
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Expire, [
          keyName,
          dto.ttl,
        ])
        .mockResolvedValue(1);

      const result = await service.updateTtl(mockBrowserClientMetadata, dto);

      expect(result).toEqual({ ttl: dto.ttl });
    });
    it('remove the existing timeout on key', async () => {
      const dto = { keyName, ttl: -1 };
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Ttl, [keyName])
        .mockResolvedValue(1000);
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Persist, [
          keyName,
        ])
        .mockResolvedValue(1);

      const result = await service.updateTtl(mockBrowserClientMetadata, dto);
      expect(result).toEqual({ ttl: dto.ttl });
    });
    it('key not found', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Expire, [
          keyName,
        ])
        .mockResolvedValue(0);

      await expect(
        service.updateTtl(mockBrowserClientMetadata, { keyName, ttl: 1000 }),
      ).rejects.toThrow(NotFoundException);
    });
    it("user don't have required permissions for updateTtl", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'EXPIRE',
      };
      browserTool.execCommand.mockRejectedValue(replyError);

      await expect(
        service.updateTtl(mockBrowserClientMetadata, { keyName, ttl: 1000 }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('removeKeyExpiration', () => {
    const keyName = 'testString';
    it('should remove key expiration', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Ttl, [keyName])
        .mockResolvedValue(1000);

      const result = await service.removeKeyExpiration(mockBrowserClientMetadata, {
        keyName,
        ttl: -1,
      });
      expect(result).toEqual({ ttl: -1 });
      expect(browserTool.execCommand).toHaveBeenCalledWith(
        mockBrowserClientMetadata,
        BrowserToolKeysCommands.Persist,
        [keyName],
      );
    });
    it('key not found', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Ttl, [keyName])
        .mockResolvedValue(-2);

      await expect(
        service.removeKeyExpiration(mockBrowserClientMetadata, { keyName, ttl: -1 }),
      ).rejects.toThrow(NotFoundException);
    });
    it("user don't have required permissions for removeKeyExpiration", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'TTL',
      };
      browserTool.execCommand.mockRejectedValue(replyError);

      await expect(
        service.removeKeyExpiration(mockBrowserClientMetadata, { keyName, ttl: -1 }),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
