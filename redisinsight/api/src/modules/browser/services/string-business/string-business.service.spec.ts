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
  mockBrowserClientMetadata,
  mockDatabaseRecommendationService,
  mockRedisConsumer,
  mockRedisNoPermError,
  mockRedisWrongTypeError,
} from 'src/__mocks__';
import {
  SetStringDto,
  SetStringWithExpireDto,
} from 'src/modules/browser/dto/string.dto';
import { BrowserToolService } from 'src/modules/browser/services/browser-tool/browser-tool.service';
import {
  BrowserToolKeysCommands,
  BrowserToolStringCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { KeytarUnavailableException } from 'src/modules/encryption/exceptions';
import { DatabaseRecommendationService } from 'src/modules/database-recommendation/database-recommendation.service';
import { RECOMMENDATION_NAMES } from 'src/constants';
import { StringBusinessService } from './string-business.service';

const mockSetStringDto: SetStringDto = {
  keyName: Buffer.from('foo'),
  value: Buffer.from('Lorem ipsum dolor sit amet.'),
};

describe('StringBusinessService', () => {
  let service: StringBusinessService;
  let browserTool;
  let recommendationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StringBusinessService,
        {
          provide: BrowserToolService,
          useFactory: mockRedisConsumer,
        },
        {
          provide: DatabaseRecommendationService,
          useFactory: mockDatabaseRecommendationService,
        },
      ],
    }).compile();

    service = module.get<StringBusinessService>(StringBusinessService);
    browserTool = module.get<BrowserToolService>(BrowserToolService);
    recommendationService = module.get<DatabaseRecommendationService>(DatabaseRecommendationService);
  });

  describe('setString', () => {
    it('set string with expiration', async () => {
      browserTool.execCommand.mockResolvedValue('OK');
      const dto: SetStringWithExpireDto = { ...mockSetStringDto, expire: 1000 };

      await expect(
        service.setString(mockBrowserClientMetadata, dto),
      ).resolves.not.toThrow();
      expect(browserTool.execCommand).toHaveBeenCalledWith(
        mockBrowserClientMetadata,
        BrowserToolStringCommands.Set,
        [dto.keyName, dto.value, 'EX', `${dto.expire}`, 'NX'],
      );
    });
    it('set string without expiration', async () => {
      browserTool.execCommand.mockResolvedValue('OK');
      const dto: SetStringDto = { ...mockSetStringDto };

      await expect(
        service.setString(mockBrowserClientMetadata, dto),
      ).resolves.not.toThrow();
      expect(browserTool.execCommand).toHaveBeenCalledWith(
        mockBrowserClientMetadata,
        BrowserToolStringCommands.Set,
        [dto.keyName, dto.value, 'NX'],
      );
    });
    it('key with this name exist', async () => {
      browserTool.execCommand.mockResolvedValue(null);

      await expect(
        service.setString(mockBrowserClientMetadata, mockSetStringDto),
      ).rejects.toThrow(ConflictException);
    });
    it("user don't have required permissions for setString", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'SET',
      };
      browserTool.execCommand.mockRejectedValue(replyError);

      await expect(
        service.setString(mockBrowserClientMetadata, mockSetStringDto),
      ).rejects.toThrow(ForbiddenException);
    });
    it('Should proxy EncryptionService errors', async () => {
      browserTool.execCommand.mockRejectedValueOnce(new KeytarUnavailableException());

      await expect(
        service.setString(mockBrowserClientMetadata, mockSetStringDto),
      ).rejects.toThrow(KeytarUnavailableException);
    });
  });

  describe('getStringValue', () => {
    it('succeed to get string value', async () => {
      browserTool.execCommand.mockResolvedValue(mockSetStringDto.value);

      const result = await service.getStringValue(
        mockBrowserClientMetadata,
        mockSetStringDto,
      );

      expect(browserTool.execCommand).toHaveBeenCalledWith(
        mockBrowserClientMetadata,
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
        service.getStringValue(mockBrowserClientMetadata, mockSetStringDto),
      ).rejects.toThrow(BadRequestException);
    });
    it('key not found', async () => {
      browserTool.execCommand.mockResolvedValue(null);

      await expect(
        service.getStringValue(mockBrowserClientMetadata, mockSetStringDto),
      ).rejects.toThrow(NotFoundException);
    });
    it("user don't have required permissions for getStringValue", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'GET',
      };
      browserTool.execCommand.mockRejectedValue(replyError);

      await expect(
        service.getStringValue(mockBrowserClientMetadata, mockSetStringDto),
      ).rejects.toThrow(ForbiddenException);
    });
    it('should call recommendationService', async () => {
      browserTool.execCommand.mockResolvedValue(mockSetStringDto.value);

      const result = await service.getStringValue(
        mockBrowserClientMetadata,
        mockSetStringDto,
      );

      expect(browserTool.execCommand).toHaveBeenCalledWith(
        mockBrowserClientMetadata,
        BrowserToolStringCommands.Get,
        [mockSetStringDto.keyName],
      );
      expect(result).toEqual({
        value: mockSetStringDto.value,
        keyName: mockSetStringDto.keyName,
      });
      expect(recommendationService.check).toBeCalledWith(
        mockBrowserClientMetadata,
        RECOMMENDATION_NAMES.STRING_TO_JSON,
        { value: result.value, keyName: mockSetStringDto.keyName },
      );

      expect(recommendationService.check).toBeCalledTimes(1);
    });
  });

  describe('updateStringValue', () => {
    it('succeed to update string without expiration', async () => {
      const dto: SetStringDto = mockSetStringDto;
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Ttl, [
          dto.keyName,
        ])
        .mockResolvedValue(-1);

      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolStringCommands.Set, [
          dto.keyName,
          dto.value,
          'XX',
        ])
        .mockResolvedValue('OK');

      await expect(
        service.updateStringValue(mockBrowserClientMetadata, dto),
      ).resolves.not.toThrow();
      expect(
        browserTool.execCommand,
      ).toHaveBeenLastCalledWith(
        mockBrowserClientMetadata,
        BrowserToolStringCommands.Set,
        [dto.keyName, dto.value, 'XX'],
      );
    });
    it('succeed to update string with expiration', async () => {
      const dto: SetStringDto = mockSetStringDto;
      const currentTtl = 1000;
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Ttl, [
          dto.keyName,
        ])
        .mockResolvedValue(currentTtl);
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolStringCommands.Set, [
          dto.keyName,
          dto.value,
          'XX',
        ])
        .mockResolvedValue('OK');

      await expect(
        service.updateStringValue(mockBrowserClientMetadata, dto),
      ).resolves.not.toThrow();
      expect(browserTool.execCommand).toHaveBeenCalledWith(
        mockBrowserClientMetadata,
        BrowserToolStringCommands.Set,
        [dto.keyName, dto.value, 'XX'],
      );
      expect(
        browserTool.execCommand,
      ).toHaveBeenLastCalledWith(
        mockBrowserClientMetadata,
        BrowserToolKeysCommands.Expire,
        [dto.keyName, currentTtl],
      );
    });
    it('key with this name does not exist', async () => {
      browserTool.execCommand.mockResolvedValue(null);

      await expect(
        service.updateStringValue(mockBrowserClientMetadata, mockSetStringDto),
      ).rejects.toThrow(NotFoundException);
    });
    it("user don't have required permissions for updateStringValue", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'SET',
      };
      browserTool.execCommand.mockRejectedValue(replyError);

      await expect(
        service.updateStringValue(mockBrowserClientMetadata, mockSetStringDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
