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
  mockRedisConsumer,
  mockRedisNoPermError,
  mockRedisWrongTypeError,
  mockDatabase,
} from 'src/__mocks__';
import {
  GetHashFieldsDto,
  HashFieldDto,
} from 'src/modules/browser/dto/hash.dto';
import { BrowserToolService } from 'src/modules/browser/services/browser-tool/browser-tool.service';
import {
  BrowserToolHashCommands,
  BrowserToolKeysCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { IFindRedisClientInstanceByOptions } from 'src/modules/redis/redis.service';
import {
  mockAddFieldsDto, mockDeleteFieldsDto,
  mockGetFieldsDto,
  mockGetFieldsResponse,
  mockRedisHScanResponse,
} from 'src/modules/browser/__mocks__';
import { HashBusinessService } from './hash-business.service';

const mockClientOptions: IFindRedisClientInstanceByOptions = {
  instanceId: mockDatabase.id,
};

describe('HashBusinessService', () => {
  let service: HashBusinessService;
  let browserTool;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HashBusinessService,
        {
          provide: BrowserToolService,
          useFactory: mockRedisConsumer,
        },
      ],
    }).compile();

    service = module.get<HashBusinessService>(HashBusinessService);
    browserTool = module.get<BrowserToolService>(BrowserToolService);
  });

  describe('createHash', () => {
    beforeEach(() => {
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolKeysCommands.Exists, [
          mockAddFieldsDto.keyName,
        ])
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
        service.createHash(mockClientOptions, { ...mockAddFieldsDto, expire }),
      ).resolves.not.toThrow();
      expect(service.createHashWithExpiration).toHaveBeenCalledWith(
        mockClientOptions,
        keyName,
        commandArgs,
        expire,
      );
    });
    it('create hash without expiration', async () => {
      service.createHashWithExpiration = jest.fn();
      const { keyName, fields } = mockAddFieldsDto;
      const commandArgs = flatMap(fields, ({ field, value }: HashFieldDto) => [field, value]);

      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolHashCommands.HSet, [
          keyName,
          ...commandArgs,
        ])
        .mockResolvedValue(1);

      await expect(
        service.createHash(mockClientOptions, mockAddFieldsDto),
      ).resolves.not.toThrow();
      expect(service.createHashWithExpiration).not.toHaveBeenCalled();
    });
    it('key with this name exist', async () => {
      const { keyName, fields } = mockAddFieldsDto;
      const args = flatMap(fields, ({ field, value }: HashFieldDto) => [field, value]);

      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolKeysCommands.Exists, [
          keyName,
        ])
        .mockResolvedValue(true);

      await expect(
        service.createHash(mockClientOptions, mockAddFieldsDto),
      ).rejects.toThrow(ConflictException);
      expect(
        browserTool.execCommand,
      ).not.toHaveBeenCalledWith(
        mockClientOptions,
        BrowserToolHashCommands.HSet,
        [keyName, ...args],
      );
    });
    it("user don't have required permissions for createHash", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'HSET',
      };
      browserTool.execCommand.mockRejectedValue(replyError);

      await expect(
        service.createHash(mockClientOptions, mockAddFieldsDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getFields', () => {
    beforeEach(() => {
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolHashCommands.HLen, [
          mockAddFieldsDto.keyName,
        ])
        .mockResolvedValue(mockAddFieldsDto.fields.length);
    });
    it('succeed to get fields of the hash', async () => {
      when(browserTool.execCommand)
        .calledWith(
          mockClientOptions,
          BrowserToolHashCommands.HScan,
          expect.anything(),
        )
        .mockResolvedValue(mockRedisHScanResponse);

      const result = await service.getFields(
        mockClientOptions,
        mockGetFieldsDto,
      );
      expect(result).toEqual(mockGetFieldsResponse);
      expect(browserTool.execCommand).toHaveBeenCalledWith(
        mockClientOptions,
        BrowserToolHashCommands.HScan,
        expect.anything(),
      );
    });
    it('succeed to find exact field in the hash', async () => {
      const item = mockAddFieldsDto.fields[0];
      const dto: GetHashFieldsDto = {
        ...mockGetFieldsDto,
        match: item.field.toString(),
      };
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolHashCommands.HGet, [
          dto.keyName,
          dto.match,
        ])
        .mockResolvedValue(item.value);

      const result = await service.getFields(mockClientOptions, dto);

      expect(result).toEqual(mockGetFieldsResponse);
      expect(browserTool.execCommand).not.toHaveBeenCalledWith(
        mockClientOptions,
        BrowserToolHashCommands.HScan,
        expect.anything(),
      );
    });
    it('failed to find exact field in the hash', async () => {
      const dto: GetHashFieldsDto = {
        ...mockGetFieldsDto,
        match: 'field',
      };
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolHashCommands.HGet, [
          dto.keyName,
          dto.match,
        ])
        .mockResolvedValue(null);

      const result = await service.getFields(mockClientOptions, dto);

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
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolHashCommands.HGet, [
          dto.keyName,
          item.field.toString(),
        ])
        .mockResolvedValue('value');

      const result = await service.getFields(mockClientOptions, dto);

      expect(result).toEqual({ ...mockGetFieldsResponse, fields: [item] });
      expect(browserTool.execCommand).not.toHaveBeenCalledWith(
        mockClientOptions,
        BrowserToolHashCommands.HScan,
        expect.anything(),
      );
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
    //       mockClientOptions,
    //       BrowserToolHashCommands.HScan,
    //       expect.anything(),
    //     )
    //     .mockResolvedValue(['200', []]);
    //
    //   await service.getFields(mockClientOptions, dto);
    //
    //   expect(browserTool.execCommand).toHaveBeenCalledTimes(maxScanCalls + 1);
    // });
    it('key with this name does not exist for getFields', async () => {
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolHashCommands.HLen, [
          mockGetFieldsDto.keyName,
        ])
        .mockResolvedValue(0);

      await expect(
        service.getFields(mockClientOptions, mockGetFieldsDto),
      ).rejects.toThrow(NotFoundException);
    });
    it("try to use 'HLEN' command not for hash data type", async () => {
      const replyError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: 'HLEN',
      };
      browserTool.execCommand.mockRejectedValue(replyError);

      await expect(
        service.getFields(mockClientOptions, mockGetFieldsDto),
      ).rejects.toThrow(BadRequestException);
    });
    it("user don't have required permissions for getFields", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'HLEN',
      };
      browserTool.execCommand.mockRejectedValue(replyError);

      await expect(
        service.getFields(mockClientOptions, mockGetFieldsDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('addFields', () => {
    beforeEach(() => {
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolKeysCommands.Exists, [
          mockAddFieldsDto.keyName,
        ])
        .mockResolvedValue(true);
    });
    it('succeed to add/update fields to the Hash data type', async () => {
      when(browserTool.execCommand)
        .calledWith(
          mockClientOptions,
          BrowserToolHashCommands.HSet,
          expect.anything(),
        )
        .mockResolvedValue(1);
      const { keyName, fields } = mockAddFieldsDto;
      const commandArgs = flatMap(fields, ({ field, value }: HashFieldDto) => [field, value]);

      await expect(
        service.addFields(mockClientOptions, mockAddFieldsDto),
      ).resolves.not.toThrow();
      expect(browserTool.execCommand).toHaveBeenCalledWith(
        mockClientOptions,
        BrowserToolKeysCommands.Exists,
        [keyName],
      );
      expect(browserTool.execCommand).toHaveBeenCalledWith(
        mockClientOptions,
        BrowserToolHashCommands.HSet,
        [keyName, ...commandArgs],
      );
    });
    it('key with this name does not exist for addFields', async () => {
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolKeysCommands.Exists, [
          mockAddFieldsDto.keyName,
        ])
        .mockResolvedValue(false);

      await expect(
        service.addFields(mockClientOptions, mockAddFieldsDto),
      ).rejects.toThrow(NotFoundException);
      expect(browserTool.execCommand).not.toHaveBeenCalledWith(
        mockClientOptions,
        BrowserToolHashCommands.HSet,
        expect.anything(),
      );
    });
    it("try to use 'HSET' command not for hash data type", async () => {
      const replyError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: 'HSET',
      };
      when(browserTool.execCommand)
        .calledWith(
          mockClientOptions,
          BrowserToolHashCommands.HSet,
          expect.anything(),
        )
        .mockRejectedValue(replyError);

      await expect(
        service.addFields(mockClientOptions, mockAddFieldsDto),
      ).rejects.toThrow(BadRequestException);
    });
    it("user don't have required permissions for addFields", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'HSET',
      };
      when(browserTool.execCommand)
        .calledWith(
          mockClientOptions,
          BrowserToolHashCommands.HSet,
          expect.anything(),
        )
        .mockRejectedValue(replyError);

      await expect(
        service.addFields(mockClientOptions, mockAddFieldsDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteFields', () => {
    beforeEach(() => {
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolKeysCommands.Exists, [
          mockDeleteFieldsDto.keyName,
        ])
        .mockResolvedValue(true);
    });
    it('succeeded to delete fields from Hash data type', async () => {
      const { fields } = mockDeleteFieldsDto;
      when(browserTool.execCommand)
        .calledWith(
          mockClientOptions,
          BrowserToolHashCommands.HDel,
          expect.anything(),
        )
        .mockResolvedValue(fields.length);

      const result = await service.deleteFields(
        mockClientOptions,
        mockDeleteFieldsDto,
      );

      expect(result).toEqual({ affected: fields.length });
    });
    it('key with this name does not exist for deleteFields', async () => {
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolKeysCommands.Exists, [
          mockDeleteFieldsDto.keyName,
        ])
        .mockResolvedValue(false);

      await expect(
        service.deleteFields(mockClientOptions, mockDeleteFieldsDto),
      ).rejects.toThrow(NotFoundException);
      expect(browserTool.execCommand).not.toHaveBeenCalledWith(
        mockClientOptions,
        BrowserToolHashCommands.HDel,
        expect.anything(),
      );
    });
    it("try to use 'HDEL' command not for Hash data type", async () => {
      const replyError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: 'HDEL',
      };
      browserTool.execCommand.mockRejectedValue(replyError);

      await expect(
        service.deleteFields(mockClientOptions, mockDeleteFieldsDto),
      ).rejects.toThrow(BadRequestException);
    });
    it("user don't have required permissions for deleteFields", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'HDEL',
      };
      browserTool.execCommand.mockRejectedValue(replyError);

      await expect(
        service.deleteFields(mockClientOptions, mockDeleteFieldsDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
