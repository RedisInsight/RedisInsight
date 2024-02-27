import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { when } from 'jest-when';
import { flatMap } from 'lodash';
import { ReplyError } from 'src/models/redis-client';
import {
  mockRedisNoPermError,
  mockRedisWrongTypeError,
  mockBrowserClientMetadata,
  mockDatabaseRecommendationService,
  mockDatabaseClientFactory,
  mockStandaloneRedisClient,
} from 'src/__mocks__';
import {
  GetHashFieldsDto,
  HashFieldDto,
} from 'src/modules/browser/hash/dto';
import {
  BrowserToolHashCommands,
  BrowserToolKeysCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import {
  mockAddFieldsDto, mockDeleteFieldsDto,
  mockGetFieldsDto,
  mockGetFieldsResponse,
  mockRedisHScanResponse,
} from 'src/modules/browser/__mocks__';
import { DatabaseRecommendationService } from 'src/modules/database-recommendation/database-recommendation.service';
import { RECOMMENDATION_NAMES } from 'src/constants';
import { HashService } from 'src/modules/browser/hash/hash.service';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';

describe('HashService', () => {
  const client = mockStandaloneRedisClient;
  let service: HashService;
  let recommendationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HashService,
        {
          provide: DatabaseClientFactory,
          useFactory: mockDatabaseClientFactory,
        },
        {
          provide: DatabaseRecommendationService,
          useFactory: mockDatabaseRecommendationService,
        },
      ],
    }).compile();

    service = module.get<HashService>(HashService);
    recommendationService = module.get<DatabaseRecommendationService>(DatabaseRecommendationService);
    client.sendCommand = jest.fn().mockResolvedValue(undefined);
  });

  describe('createHash', () => {
    beforeEach(() => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, mockAddFieldsDto.keyName])
        .mockResolvedValue(false);
    });
    it('create hash with expiration', async () => {
      service.createHashWithExpiration = jest
        .fn()
        .mockResolvedValue(undefined);
      const { keyName, fields } = mockAddFieldsDto;
      const expire = 1000;
      const commandArgs = flatMap(fields, ({ field, value }: HashFieldDto) => [field, value]);

      await expect(
        service.createHash(mockBrowserClientMetadata, { ...mockAddFieldsDto, expire }),
      ).resolves.not.toThrow();
      expect(service.createHashWithExpiration).toHaveBeenCalledWith(
        client,
        keyName,
        commandArgs,
        expire,
      );
    });
    it('create hash without expiration', async () => {
      service.createHashWithExpiration = jest.fn();
      const { keyName, fields } = mockAddFieldsDto;
      const commandArgs = flatMap(fields, ({ field, value }: HashFieldDto) => [field, value]);

      when(client.sendCommand)
        .calledWith([BrowserToolHashCommands.HSet, keyName, ...commandArgs])
        .mockResolvedValue(1);

      await expect(
        service.createHash(mockBrowserClientMetadata, mockAddFieldsDto),
      ).resolves.not.toThrow();
      expect(service.createHashWithExpiration).not.toHaveBeenCalled();
    });
    it('key with this name exist', async () => {
      const { keyName, fields } = mockAddFieldsDto;
      const args = flatMap(fields, ({ field, value }: HashFieldDto) => [field, value]);

      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, keyName])
        .mockResolvedValue(true);

      await expect(
        service.createHash(mockBrowserClientMetadata, mockAddFieldsDto),
      ).rejects.toThrow(ConflictException);
      expect(client.sendCommand).not.toHaveBeenCalledWith([
        BrowserToolHashCommands.HSet,
        keyName,
        ...args,
      ]);
    });
    it("user don't have required permissions for createHash", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'HSET',
      };
      client.sendCommand.mockRejectedValue(replyError);

      await expect(
        service.createHash(mockBrowserClientMetadata, mockAddFieldsDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getFields', () => {
    beforeEach(() => {
      when(client.sendCommand)
        .calledWith([BrowserToolHashCommands.HLen, mockAddFieldsDto.keyName])
        .mockResolvedValue(mockAddFieldsDto.fields.length);
    });
    it('succeed to get fields of the hash', async () => {
      when(client.sendCommand)
        .calledWith(expect.arrayContaining([
          BrowserToolHashCommands.HScan,
          expect.anything(),
        ]))
        .mockResolvedValue(mockRedisHScanResponse);

      const result = await service.getFields(
        mockBrowserClientMetadata,
        mockGetFieldsDto,
      );
      expect(result).toEqual(mockGetFieldsResponse);
      expect(client.sendCommand).toHaveBeenCalledWith(
        expect.arrayContaining([
          BrowserToolHashCommands.HScan,
          expect.anything(),
        ]),
      );
    });
    it('succeed to find exact field in the hash', async () => {
      const item = mockAddFieldsDto.fields[0];
      const dto: GetHashFieldsDto = {
        ...mockGetFieldsDto,
        match: item.field.toString(),
      };
      when(client.sendCommand)
        .calledWith([BrowserToolHashCommands.HGet, dto.keyName, dto.match])
        .mockResolvedValue(item.value);

      const result = await service.getFields(mockBrowserClientMetadata, dto);

      expect(result).toEqual(mockGetFieldsResponse);
      expect(client.sendCommand).not.toHaveBeenCalledWith([
        BrowserToolHashCommands.HScan,
        expect.anything(),
      ]);
    });
    it('failed to find exact field in the hash', async () => {
      const dto: GetHashFieldsDto = {
        ...mockGetFieldsDto,
        match: 'field',
      };
      when(client.sendCommand)
        .calledWith([BrowserToolHashCommands.HGet, dto.keyName, dto.match])
        .mockResolvedValue(null);

      const result = await service.getFields(mockBrowserClientMetadata, dto);

      expect(result).toEqual({ ...mockGetFieldsResponse, fields: [] });
    });
    it('should not call scan when math contains escaped glob', async () => {
      const item = {
        field: Buffer.from('fi[a-e]ld'),
        value: Buffer.from('value'),
      };
      const dto: GetHashFieldsDto = {
        ...mockGetFieldsDto,
        match: 'fi\\[a-e\\]ld',
      };
      when(client.sendCommand)
        .calledWith([BrowserToolHashCommands.HGet, dto.keyName, item.field.toString()])
        .mockResolvedValue('value');

      const result = await service.getFields(mockBrowserClientMetadata, dto);

      expect(result).toEqual({ ...mockGetFieldsResponse, fields: [item] });
      expect(client.sendCommand).not.toHaveBeenCalledWith([
        BrowserToolHashCommands.HScan,
        expect.anything(),
      ]);
    });
    // TODO: uncomment after enabling threshold for hash scan
    // it('should stop hash full scan', async () => {
    //   const dto: GetHashFieldsDto = {
    //     ...mockGetFieldsDto,
    //     count: REDIS_SCAN_CONFIG.countDefault,
    //     match: '*un-exist-field*',
    //   };
    //   const maxScanCalls = Math.round(
    //     REDIS_SCAN_CONFIG.countThreshold / REDIS_SCAN_CONFIG.countDefault,
    //   );
    //   when(browserTool.execCommand)
    //     .calledWith(
    //       mockBrowserClientMetadata,
    //       BrowserToolHashCommands.HScan,
    //       expect.anything(),
    //     )
    //     .mockResolvedValue(['200', []]);
    //
    //   await service.getFields(mockBrowserClientMetadata, dto);
    //
    //   expect(browserTool.execCommand).toHaveBeenCalledTimes(maxScanCalls + 1);
    // });
    it('key with this name does not exist for getFields', async () => {
      when(client.sendCommand)
        .calledWith([BrowserToolHashCommands.HLen, mockGetFieldsDto.keyName])
        .mockResolvedValue(0);

      await expect(
        service.getFields(mockBrowserClientMetadata, mockGetFieldsDto),
      ).rejects.toThrow(NotFoundException);
    });
    it("try to use 'HLEN' command not for hash data type", async () => {
      const replyError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: 'HLEN',
      };
      client.sendCommand.mockRejectedValue(replyError);

      await expect(
        service.getFields(mockBrowserClientMetadata, mockGetFieldsDto),
      ).rejects.toThrow(BadRequestException);
    });
    it("user don't have required permissions for getFields", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'HLEN',
      };
      client.sendCommand.mockRejectedValue(replyError);

      await expect(
        service.getFields(mockBrowserClientMetadata, mockGetFieldsDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should call recommendationService', async () => {
      when(client.sendCommand)
        .calledWith(expect.arrayContaining([
          BrowserToolHashCommands.HScan,
          expect.anything(),
        ]))
        .mockResolvedValue(mockRedisHScanResponse);

      const result = await service.getFields(
        mockBrowserClientMetadata,
        mockGetFieldsDto,
      );
      expect(result).toEqual(mockGetFieldsResponse);
      expect(client.sendCommand).toHaveBeenCalledWith(
        expect.arrayContaining([
          BrowserToolHashCommands.HScan,
          expect.anything(),
        ]),
      );

      expect(recommendationService.check).toBeCalledWith(
        mockBrowserClientMetadata,
        RECOMMENDATION_NAMES.BIG_HASHES,
        { total: result.total, keyName: result.keyName },
      );

      expect(recommendationService.check).toBeCalledTimes(1);
    });
  });

  describe('addFields', () => {
    beforeEach(() => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, mockAddFieldsDto.keyName])
        .mockResolvedValue(true);
    });
    it('succeed to add/update fields to the Hash data type', async () => {
      when(client.sendCommand)
        .calledWith([BrowserToolHashCommands.HSet, expect.anything()])
        .mockResolvedValue(1);
      const { keyName, fields } = mockAddFieldsDto;
      const commandArgs = flatMap(fields, ({ field, value }: HashFieldDto) => [field, value]);

      await expect(
        service.addFields(mockBrowserClientMetadata, mockAddFieldsDto),
      ).resolves.not.toThrow();
      expect(client.sendCommand).toHaveBeenCalledWith([
        BrowserToolKeysCommands.Exists,
        keyName,
      ]);
      expect(client.sendCommand).toHaveBeenCalledWith([
        BrowserToolHashCommands.HSet,
        keyName,
        ...commandArgs,
      ]);
    });
    it('key with this name does not exist for addFields', async () => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, mockAddFieldsDto.keyName])
        .mockResolvedValue(false);

      await expect(
        service.addFields(mockBrowserClientMetadata, mockAddFieldsDto),
      ).rejects.toThrow(NotFoundException);
      expect(client.sendCommand).not.toHaveBeenCalledWith([
        BrowserToolHashCommands.HSet,
        expect.anything(),
      ]);
    });
    it("try to use 'HSET' command not for hash data type", async () => {
      const replyError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: 'HSET',
      };
      when(client.sendCommand)
        .calledWith(expect.arrayContaining([
          BrowserToolHashCommands.HSet,
          expect.anything(),
        ]))
        .mockRejectedValue(replyError);

      await expect(
        service.addFields(mockBrowserClientMetadata, mockAddFieldsDto),
      ).rejects.toThrow(BadRequestException);
    });
    it("user don't have required permissions for addFields", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'HSET',
      };
      when(client.sendCommand)
        .calledWith(expect.arrayContaining([
          BrowserToolHashCommands.HSet,
          expect.anything(),
        ]))
        .mockRejectedValue(replyError);

      await expect(
        service.addFields(mockBrowserClientMetadata, mockAddFieldsDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteFields', () => {
    beforeEach(() => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, mockDeleteFieldsDto.keyName])
        .mockResolvedValue(true);
    });
    it('succeeded to delete fields from Hash data type', async () => {
      const { fields } = mockDeleteFieldsDto;
      when(client.sendCommand)
        .calledWith(expect.arrayContaining([
          BrowserToolHashCommands.HDel,
          expect.anything(),
        ]))
        .mockResolvedValue(fields.length);

      const result = await service.deleteFields(
        mockBrowserClientMetadata,
        mockDeleteFieldsDto,
      );

      expect(result).toEqual({ affected: fields.length });
    });
    it('key with this name does not exist for deleteFields', async () => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, mockDeleteFieldsDto.keyName])
        .mockResolvedValue(false);

      await expect(
        service.deleteFields(mockBrowserClientMetadata, mockDeleteFieldsDto),
      ).rejects.toThrow(NotFoundException);
      expect(client.sendCommand).not.toHaveBeenCalledWith([
        BrowserToolHashCommands.HDel,
        expect.anything(),
      ]);
    });
    it("try to use 'HDEL' command not for Hash data type", async () => {
      const replyError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: 'HDEL',
      };
      client.sendCommand.mockRejectedValue(replyError);

      await expect(
        service.deleteFields(mockBrowserClientMetadata, mockDeleteFieldsDto),
      ).rejects.toThrow(BadRequestException);
    });
    it("user don't have required permissions for deleteFields", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'HDEL',
      };
      client.sendCommand.mockRejectedValue(replyError);

      await expect(
        service.deleteFields(mockBrowserClientMetadata, mockDeleteFieldsDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
