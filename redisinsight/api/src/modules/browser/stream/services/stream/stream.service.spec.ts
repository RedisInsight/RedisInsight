import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import { mockRedisConsumer, MockType, mockBrowserClientMetadata } from 'src/__mocks__';
import { BrowserToolService } from 'src/modules/browser/services/browser-tool/browser-tool.service';
import {
  BrowserToolKeysCommands,
  BrowserToolStreamCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { StreamService } from 'src/modules/browser/stream/services/stream/stream.service';
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { RedisErrorCodes, SortOrder } from 'src/constants';
import {
  mockAddStreamEntriesDto,
  mockEmptyStreamEntriesReply,
  mockEmptyStreamInfo,
  mockEmptyStreamInfoReply,
  mockGetStreamEntriesDto,
  mockStreamEntries,
  mockStreamEntriesReply,
  mockStreamEntry,
  mockStreamInfo,
  mockStreamInfoReply,
} from 'src/modules/browser/__mocks__';

describe('StreamService', () => {
  let service: StreamService;
  let browserTool: MockType<BrowserToolService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StreamService,
        {
          provide: BrowserToolService,
          useFactory: mockRedisConsumer,
        },
      ],
    }).compile();

    service = module.get(StreamService);
    browserTool = module.get(BrowserToolService);
  });

  describe('createStream', () => {
    beforeEach(() => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Exists, [mockAddStreamEntriesDto.keyName])
        .mockResolvedValue(false);
      browserTool.execMulti.mockResolvedValue([null, [[null, '123-1']]]);
    });
    it('create stream with expiration', async () => {
      await expect(
        service.createStream(mockBrowserClientMetadata, {
          ...mockAddStreamEntriesDto,
          expire: 1000,
        }),
      ).resolves.not.toThrow();
      expect(browserTool.execMulti).toHaveBeenCalledWith(mockBrowserClientMetadata, [
        [BrowserToolStreamCommands.XAdd, mockAddStreamEntriesDto.keyName, mockStreamEntry.id,
          mockStreamEntry.fields[0].name, mockStreamEntry.fields[0].value],
        [BrowserToolKeysCommands.Expire, mockAddStreamEntriesDto.keyName, 1000],
      ]);
    });
    it('create stream without expiration', async () => {
      await expect(
        service.createStream(mockBrowserClientMetadata, {
          ...mockAddStreamEntriesDto,
        }),
      ).resolves.not.toThrow();
      expect(browserTool.execMulti).toHaveBeenCalledWith(mockBrowserClientMetadata, [
        [BrowserToolStreamCommands.XAdd, mockAddStreamEntriesDto.keyName, mockStreamEntry.id,
          mockStreamEntry.fields[0].name, mockStreamEntry.fields[0].value],
      ]);
    });
    it('should throw error key exists', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Exists, [mockAddStreamEntriesDto.keyName])
        .mockResolvedValueOnce(true);

      try {
        await service.createStream(mockBrowserClientMetadata, {
          ...mockAddStreamEntriesDto,
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(ConflictException);
        expect(e.message).toEqual(ERROR_MESSAGES.KEY_NAME_EXIST);
      }
    });
    it('should throw Not Found error', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Exists, [mockAddStreamEntriesDto.keyName])
        .mockRejectedValueOnce(new NotFoundException(ERROR_MESSAGES.INVALID_DATABASE_INSTANCE_ID));

      try {
        await service.createStream(mockBrowserClientMetadata, {
          ...mockAddStreamEntriesDto,
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.INVALID_DATABASE_INSTANCE_ID);
      }
    });
    it('should throw Wrong Type error', async () => {
      browserTool.execMulti.mockResolvedValue([new Error(RedisErrorCodes.WrongType), [[null, '123-1']]]);

      try {
        await service.createStream(mockBrowserClientMetadata, {
          ...mockAddStreamEntriesDto,
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual(RedisErrorCodes.WrongType);
      }
    });
    it('should throw Bad Request when incorrect ID', async () => {
      browserTool.execMulti.mockResolvedValue([
        new Error('ID specified in XADD is equal or smaller'),
        [[null, '123-1']],
      ]);

      try {
        await service.createStream(mockBrowserClientMetadata, {
          ...mockAddStreamEntriesDto,
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual('ID specified in XADD is equal or smaller');
      }
    });
    it('should throw Internal Server error', async () => {
      browserTool.execMulti.mockResolvedValue([
        new Error('oO'),
        [[null, '123-1']],
      ]);

      try {
        await service.createStream(mockBrowserClientMetadata, {
          ...mockAddStreamEntriesDto,
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
        expect(e.message).toEqual('oO');
      }
    });
  });
  describe('addEntries', () => {
    beforeEach(() => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Exists, [mockAddStreamEntriesDto.keyName])
        .mockResolvedValue(true);
      browserTool.execMulti.mockResolvedValue([null, [[null, '123-1']]]);
    });
    it('add entries', async () => {
      await expect(
        service.addEntries(mockBrowserClientMetadata, {
          ...mockAddStreamEntriesDto,
        }),
      ).resolves.not.toThrow();
      expect(browserTool.execMulti).toHaveBeenCalledWith(mockBrowserClientMetadata, [
        [BrowserToolStreamCommands.XAdd, mockAddStreamEntriesDto.keyName, mockStreamEntry.id,
          mockStreamEntry.fields[0].name, mockStreamEntry.fields[0].value],
      ]);
    });
    it('should throw Not Found when key does not exists', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Exists, [mockAddStreamEntriesDto.keyName])
        .mockResolvedValueOnce(false);

      try {
        await service.addEntries(mockBrowserClientMetadata, {
          ...mockAddStreamEntriesDto,
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.KEY_NOT_EXIST);
      }
    });
    it('should throw Not Found error', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Exists, [mockAddStreamEntriesDto.keyName])
        .mockRejectedValueOnce(new NotFoundException(ERROR_MESSAGES.INVALID_DATABASE_INSTANCE_ID));

      try {
        await service.addEntries(mockBrowserClientMetadata, {
          ...mockAddStreamEntriesDto,
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.INVALID_DATABASE_INSTANCE_ID);
      }
    });
    it('should throw Wrong Type error', async () => {
      browserTool.execMulti.mockResolvedValue([new Error(RedisErrorCodes.WrongType), [[null, '123-1']]]);

      try {
        await service.addEntries(mockBrowserClientMetadata, {
          ...mockAddStreamEntriesDto,
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual(RedisErrorCodes.WrongType);
      }
    });
    it('should throw Bad Request when incorrect ID', async () => {
      browserTool.execMulti.mockResolvedValue([
        new Error('ID specified in XADD is equal or smaller'),
        [[null, '123-1']],
      ]);

      try {
        await service.addEntries(mockBrowserClientMetadata, {
          ...mockAddStreamEntriesDto,
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual('ID specified in XADD is equal or smaller');
      }
    });
    it('should throw Internal Server error', async () => {
      browserTool.execMulti.mockResolvedValue([
        new Error('oO'),
        [[null, '123-1']],
      ]);

      try {
        await service.addEntries(mockBrowserClientMetadata, {
          ...mockAddStreamEntriesDto,
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
        expect(e.message).toEqual('oO');
      }
    });
  });
  describe('get entries from empty stream', () => {
    beforeEach(() => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Exists, [mockAddStreamEntriesDto.keyName])
        .mockResolvedValue(true);
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolStreamCommands.XInfoStream, expect.anything())
        .mockResolvedValue(mockEmptyStreamInfoReply);
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolStreamCommands.XRevRange, expect.anything())
        .mockResolvedValue(mockEmptyStreamEntriesReply);
    });
    it('Should return stream with 0 entries', async () => {
      const result = await service.getEntries(mockBrowserClientMetadata, {
        ...mockGetStreamEntriesDto,
      });
      expect(result).toEqual({
        ...mockEmptyStreamInfo,
        entries: mockEmptyStreamEntriesReply,
      });
    });
  });
  describe('getEntries', () => {
    beforeEach(() => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Exists, expect.anything())
        .mockResolvedValue(true);
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolStreamCommands.XInfoStream, expect.anything())
        .mockResolvedValue(mockStreamInfoReply);
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolStreamCommands.XRevRange, expect.anything())
        .mockResolvedValue(mockStreamEntriesReply);
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolStreamCommands.XRange, expect.anything())
        .mockResolvedValue(mockStreamEntriesReply);
    });
    it('get entries DESC', async () => {
      const result = await service.getEntries(mockBrowserClientMetadata, {
        ...mockGetStreamEntriesDto,
      });
      expect(result).toEqual({
        ...mockStreamInfo,
        entries: mockStreamEntries,
      });
    });
    it('get entries ASC', async () => {
      const result = await service.getEntries(mockBrowserClientMetadata, {
        ...mockGetStreamEntriesDto,
        sortOrder: SortOrder.Asc,
      });
      expect(result).toEqual({
        ...mockStreamInfo,
        entries: mockStreamEntries,
      });
    });
    it('should throw Not Found when key does not exists', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Exists, [mockAddStreamEntriesDto.keyName])
        .mockResolvedValueOnce(false);

      try {
        await service.getEntries(mockBrowserClientMetadata, {
          ...mockGetStreamEntriesDto,
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.KEY_NOT_EXIST);
      }
    });
    it('should throw Not Found error', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Exists, [mockAddStreamEntriesDto.keyName])
        .mockRejectedValueOnce(new NotFoundException(ERROR_MESSAGES.INVALID_DATABASE_INSTANCE_ID));

      try {
        await service.getEntries(mockBrowserClientMetadata, {
          ...mockGetStreamEntriesDto,
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.INVALID_DATABASE_INSTANCE_ID);
      }
    });
    it('should throw Wrong Type error', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolStreamCommands.XInfoStream, [mockAddStreamEntriesDto.keyName])
        .mockRejectedValueOnce(new Error(RedisErrorCodes.WrongType));

      try {
        await service.getEntries(mockBrowserClientMetadata, {
          ...mockAddStreamEntriesDto,
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual(RedisErrorCodes.WrongType);
      }
    });
    it('should throw Internal Server error', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolStreamCommands.XInfoStream, [mockAddStreamEntriesDto.keyName])
        .mockRejectedValueOnce(new Error('oO'));

      try {
        await service.getEntries(mockBrowserClientMetadata, {
          ...mockGetStreamEntriesDto,
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
        expect(e.message).toEqual('oO');
      }
    });
  });
  describe('deleteEntries', () => {
    const mockEntriesIds = mockStreamEntries.map(({ id }) => (id));
    beforeEach(() => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Exists, expect.anything())
        .mockResolvedValue(true);
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolStreamCommands.XInfoStream, expect.anything())
        .mockResolvedValue(mockStreamInfoReply);
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolStreamCommands.XRevRange, expect.anything())
        .mockResolvedValue(mockStreamEntriesReply);
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolStreamCommands.XRange, expect.anything())
        .mockResolvedValue(mockStreamEntriesReply);
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolStreamCommands.XDel, expect.anything())
        .mockResolvedValue(mockStreamEntries.length);
    });
    it('delete entries', async () => {
      const result = await service.deleteEntries(mockBrowserClientMetadata, {
        keyName: mockAddStreamEntriesDto.keyName,
        entries: mockEntriesIds,
      });
      expect(result).toEqual({ affected: mockStreamEntries.length });
    });
    it('should throw Not Found when key does not exists', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Exists, [mockAddStreamEntriesDto.keyName])
        .mockResolvedValueOnce(false);

      try {
        await service.deleteEntries(mockBrowserClientMetadata, {
          keyName: mockAddStreamEntriesDto.keyName,
          entries: mockEntriesIds,
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.KEY_NOT_EXIST);
      }
    });
    it('should throw Wrong Type error', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolStreamCommands.XInfoStream, [mockAddStreamEntriesDto.keyName])
        .mockRejectedValueOnce(new Error(RedisErrorCodes.WrongType));

      try {
        await service.getEntries(mockBrowserClientMetadata, {
          ...mockAddStreamEntriesDto,
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual(RedisErrorCodes.WrongType);
      }
    });
  });
});
