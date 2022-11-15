import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { when } from 'jest-when';
import { ReplyError } from 'src/models/redis-client';
import {
  mockRedisConsumer,
  mockRedisNoPermError,
  mockRedisWrongTypeError,
  mockStandaloneDatabaseEntity,
} from 'src/__mocks__';
import { IFindRedisClientInstanceByOptions } from 'src/modules/redis/redis.service';
import {
  SetStringDto,
  SetStringWithExpireDto,
} from 'src/modules/browser/dto/string.dto';
import { BrowserToolService } from 'src/modules/browser/services/browser-tool/browser-tool.service';
import {
  BrowserToolKeysCommands,
  BrowserToolStringCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { KeytarUnavailableException } from 'src/modules/core/encryption/exceptions';
import { StringBusinessService } from './string-business.service';

const mockSetStringDto: SetStringDto = {
  keyName: Buffer.from('foo'),
  value: Buffer.from('Lorem ipsum dolor sit amet.'),
};

const mockClientOptions: IFindRedisClientInstanceByOptions = {
  instanceId: mockStandaloneDatabaseEntity.id,
};

describe('StringBusinessService', () => {
  let service: StringBusinessService;
  let browserTool;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StringBusinessService,
        {
          provide: BrowserToolService,
          useFactory: mockRedisConsumer,
        },
      ],
    }).compile();

    service = module.get<StringBusinessService>(StringBusinessService);
    browserTool = module.get<BrowserToolService>(BrowserToolService);
  });

  describe('setString', () => {
    it('set string with expiration', async () => {
      browserTool.execCommand.mockResolvedValue('OK');
      const dto: SetStringWithExpireDto = { ...mockSetStringDto, expire: 1000 };

      await expect(
        service.setString(mockClientOptions, dto),
      ).resolves.not.toThrow();
      expect(browserTool.execCommand).toHaveBeenCalledWith(
        mockClientOptions,
        BrowserToolStringCommands.Set,
        [dto.keyName, dto.value, 'EX', `${dto.expire}`, 'NX'],
      );
    });
    it('set string without expiration', async () => {
      browserTool.execCommand.mockResolvedValue('OK');
      const dto: SetStringDto = { ...mockSetStringDto };

      await expect(
        service.setString(mockClientOptions, dto),
      ).resolves.not.toThrow();
      expect(browserTool.execCommand).toHaveBeenCalledWith(
        mockClientOptions,
        BrowserToolStringCommands.Set,
        [dto.keyName, dto.value, 'NX'],
      );
    });
    it('key with this name exist', async () => {
      browserTool.execCommand.mockResolvedValue(null);

      await expect(
        service.setString(mockClientOptions, mockSetStringDto),
      ).rejects.toThrow(ConflictException);
    });
    it("user don't have required permissions for setString", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'SET',
      };
      browserTool.execCommand.mockRejectedValue(replyError);

      await expect(
        service.setString(mockClientOptions, mockSetStringDto),
      ).rejects.toThrow(ForbiddenException);
    });
    it('Should proxy EncryptionService errors', async () => {
      browserTool.execCommand.mockRejectedValueOnce(new KeytarUnavailableException());

      await expect(
        service.setString(mockClientOptions, mockSetStringDto),
      ).rejects.toThrow(KeytarUnavailableException);
    });
  });

  describe('getStringValue', () => {
    it('succeed to get string value', async () => {
      browserTool.execCommand.mockResolvedValue(mockSetStringDto.value);

      const result = await service.getStringValue(
        mockClientOptions,
        mockSetStringDto.keyName,
      );

      expect(browserTool.execCommand).toHaveBeenCalledWith(
        mockClientOptions,
        BrowserToolStringCommands.Get,
        [mockSetStringDto.keyName],
      );
      expect(result).toEqual({
        value: mockSetStringDto.value,
        keyName: mockSetStringDto.keyName,
      });
    });
    it("try to use 'GET' command not for string data type", async () => {
      const replyError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: 'GET',
      };
      browserTool.execCommand.mockRejectedValue(replyError);

      await expect(
        service.getStringValue(mockClientOptions, mockSetStringDto.keyName),
      ).rejects.toThrow(BadRequestException);
    });
    it('key not found', async () => {
      browserTool.execCommand.mockResolvedValue(null);

      await expect(
        service.getStringValue(mockClientOptions, mockSetStringDto.keyName),
      ).rejects.toThrow(NotFoundException);
    });
    it("user don't have required permissions for getStringValue", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'GET',
      };
      browserTool.execCommand.mockRejectedValue(replyError);

      await expect(
        service.getStringValue(mockClientOptions, mockSetStringDto.keyName),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateStringValue', () => {
    it('succeed to update string without expiration', async () => {
      const dto: SetStringDto = mockSetStringDto;
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolKeysCommands.Ttl, [
          dto.keyName,
        ])
        .mockResolvedValue(-1);

      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolStringCommands.Set, [
          dto.keyName,
          dto.value,
          'XX',
        ])
        .mockResolvedValue('OK');

      await expect(
        service.updateStringValue(mockClientOptions, dto),
      ).resolves.not.toThrow();
      expect(
        browserTool.execCommand,
      ).toHaveBeenLastCalledWith(
        mockClientOptions,
        BrowserToolStringCommands.Set,
        [dto.keyName, dto.value, 'XX'],
      );
    });
    it('succeed to update string with expiration', async () => {
      const dto: SetStringDto = mockSetStringDto;
      const currentTtl = 1000;
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolKeysCommands.Ttl, [
          dto.keyName,
        ])
        .mockResolvedValue(currentTtl);
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolStringCommands.Set, [
          dto.keyName,
          dto.value,
          'XX',
        ])
        .mockResolvedValue('OK');

      await expect(
        service.updateStringValue(mockClientOptions, dto),
      ).resolves.not.toThrow();
      expect(browserTool.execCommand).toHaveBeenCalledWith(
        mockClientOptions,
        BrowserToolStringCommands.Set,
        [dto.keyName, dto.value, 'XX'],
      );
      expect(
        browserTool.execCommand,
      ).toHaveBeenLastCalledWith(
        mockClientOptions,
        BrowserToolKeysCommands.Expire,
        [dto.keyName, currentTtl],
      );
    });
    it('key with this name does not exist', async () => {
      browserTool.execCommand.mockResolvedValue(null);

      await expect(
        service.updateStringValue(mockClientOptions, mockSetStringDto),
      ).rejects.toThrow(NotFoundException);
    });
    it("user don't have required permissions for updateStringValue", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'SET',
      };
      browserTool.execCommand.mockRejectedValue(replyError);

      await expect(
        service.updateStringValue(mockClientOptions, mockSetStringDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
