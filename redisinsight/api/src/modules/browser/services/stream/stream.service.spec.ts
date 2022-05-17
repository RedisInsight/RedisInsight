import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import { mockRedisConsumer, mockStandaloneDatabaseEntity, MockType } from 'src/__mocks__';
import { IFindRedisClientInstanceByOptions } from 'src/modules/core/services/redis/redis.service';
import { BrowserToolService } from 'src/modules/browser/services/browser-tool/browser-tool.service';
import { BrowserToolKeysCommands, BrowserToolStreamCommands } from 'src/modules/browser/constants/browser-tool-commands';
import { StreamService } from 'src/modules/browser/services/stream/stream.service';
import { AddStreamEntriesDto, GetStreamEntriesDto, StreamEntryDto } from 'src/modules/browser/dto/stream.dto';
import {
  BadRequestException, ConflictException, InternalServerErrorException, NotFoundException,
} from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { RedisErrorCodes, SortOrder } from 'src/constants';

const mockClientOptions: IFindRedisClientInstanceByOptions = {
  instanceId: mockStandaloneDatabaseEntity.id,
};

const mockStreamEntry: StreamEntryDto = {
  id: '*',
  fields: {
    field1: 'value1',
  },
};
const mockAddStreamEntriesDto: AddStreamEntriesDto = {
  keyName: 'testList',
  entries: [mockStreamEntry],
};
const mockStreamInfoReply = [
  'length',
  2,
  'radix-tree-keys',
  1,
  'radix-tree-nodes',
  2,
  'last-generated-id',
  '1651130346487-1',
  'groups',
  0,
  'first-entry',
  ['1651130346487-0', ['field1', 'value1', 'field2', 'value2']],
  'last-entry',
  ['1651130346487-1', ['field1', 'value1', 'field2', 'value2']],
];

const mockEmptyStreamInfoReply = [
  'length',
  0,
  'radix-tree-keys',
  1,
  'radix-tree-nodes',
  2,
  'last-generated-id',
  '1651130346487-1',
  'groups',
  0,
  'first-entry',
  'null',
  'last-entry',
  'null',
];

const mockEmptyStreamInfo = {
  keyName: mockAddStreamEntriesDto.keyName,
  total: 0,
  lastGeneratedId: '1651130346487-1',
  firstEntry: null,
  lastEntry: null,
};

const mockStreamInfo = {
  keyName: mockAddStreamEntriesDto.keyName,
  total: 2,
  lastGeneratedId: '1651130346487-1',
  firstEntry: {
    id: '1651130346487-0',
    fields: { field1: 'value1', field2: 'value2' },
  },
  lastEntry: {
    id: '1651130346487-1',
    fields: { field1: 'value1', field2: 'value2' },
  },
};
const mockStreamEntriesReply = [
  ['1651130346487-1', ['field1', 'value1', 'field2', 'value2']],
  ['1651130346487-0', ['field1', 'value1', 'field2', 'value2']],
];
const mockEmptyStreamEntriesReply = [];
const mockStreamEntries = [
  { id: '1651130346487-1', fields: { field1: 'value1', field2: 'value2' } },
  { id: '1651130346487-0', fields: { field1: 'value1', field2: 'value2' } },
];

const mockGetStreamEntriesDto: GetStreamEntriesDto = {
  keyName: mockAddStreamEntriesDto.keyName,
  start: '-',
  end: '+',
  sortOrder: SortOrder.Desc,
};

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
        .calledWith(mockClientOptions, BrowserToolKeysCommands.Exists, [mockAddStreamEntriesDto.keyName])
        .mockResolvedValue(false);
      browserTool.execMulti.mockResolvedValue([null, [[null, '123-1']]]);
    });
    it('create stream with expiration', async () => {
      await expect(
        service.createStream(mockClientOptions, {
          ...mockAddStreamEntriesDto,
          expire: 1000,
        }),
      ).resolves.not.toThrow();
      expect(browserTool.execMulti).toHaveBeenCalledWith(mockClientOptions, [
        [BrowserToolStreamCommands.XAdd, mockAddStreamEntriesDto.keyName, mockStreamEntry.id,
          ...Object.keys(mockStreamEntry.fields), ...Object.values(mockStreamEntry.fields)],
        [BrowserToolKeysCommands.Expire, mockAddStreamEntriesDto.keyName, 1000],
      ]);
    });
    it('create stream without expiration', async () => {
      await expect(
        service.createStream(mockClientOptions, {
          ...mockAddStreamEntriesDto,
        }),
      ).resolves.not.toThrow();
      expect(browserTool.execMulti).toHaveBeenCalledWith(mockClientOptions, [
        [BrowserToolStreamCommands.XAdd, mockAddStreamEntriesDto.keyName, mockStreamEntry.id,
          ...Object.keys(mockStreamEntry.fields), ...Object.values(mockStreamEntry.fields)],
      ]);
    });
    it('should throw error key exists', async () => {
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolKeysCommands.Exists, [mockAddStreamEntriesDto.keyName])
        .mockResolvedValueOnce(true);

      try {
        await service.createStream(mockClientOptions, {
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
        .calledWith(mockClientOptions, BrowserToolKeysCommands.Exists, [mockAddStreamEntriesDto.keyName])
        .mockRejectedValueOnce(new NotFoundException(ERROR_MESSAGES.INVALID_DATABASE_INSTANCE_ID));

      try {
        await service.createStream(mockClientOptions, {
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
        await service.createStream(mockClientOptions, {
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
        await service.createStream(mockClientOptions, {
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
        await service.createStream(mockClientOptions, {
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
        .calledWith(mockClientOptions, BrowserToolKeysCommands.Exists, [mockAddStreamEntriesDto.keyName])
        .mockResolvedValue(true);
      browserTool.execMulti.mockResolvedValue([null, [[null, '123-1']]]);
    });
    it('add entries', async () => {
      await expect(
        service.addEntries(mockClientOptions, {
          ...mockAddStreamEntriesDto,
        }),
      ).resolves.not.toThrow();
      expect(browserTool.execMulti).toHaveBeenCalledWith(mockClientOptions, [
        [BrowserToolStreamCommands.XAdd, mockAddStreamEntriesDto.keyName, mockStreamEntry.id,
          ...Object.keys(mockStreamEntry.fields), ...Object.values(mockStreamEntry.fields)],
      ]);
    });
    it('should throw Not Found when key does not exists', async () => {
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolKeysCommands.Exists, [mockAddStreamEntriesDto.keyName])
        .mockResolvedValueOnce(false);

      try {
        await service.addEntries(mockClientOptions, {
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
        .calledWith(mockClientOptions, BrowserToolKeysCommands.Exists, [mockAddStreamEntriesDto.keyName])
        .mockRejectedValueOnce(new NotFoundException(ERROR_MESSAGES.INVALID_DATABASE_INSTANCE_ID));

      try {
        await service.addEntries(mockClientOptions, {
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
        await service.addEntries(mockClientOptions, {
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
        await service.addEntries(mockClientOptions, {
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
        await service.addEntries(mockClientOptions, {
          ...mockAddStreamEntriesDto,
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
        expect(e.message).toEqual('oO');
      }
    });
  });
  describe('get etries from empty stream', () => {
    beforeEach(() => {
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolKeysCommands.Exists, [mockAddStreamEntriesDto.keyName])
        .mockResolvedValue(true);
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolStreamCommands.XInfoStream, [mockAddStreamEntriesDto.keyName])
        .mockResolvedValue(mockEmptyStreamInfoReply);
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolStreamCommands.XRevRange, expect.anything())
        .mockResolvedValue(mockEmptyStreamEntriesReply);
    });
    it('Should return stream with 0 entries', async () => {
      const result = await service.getEntries(mockClientOptions, {
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
        .calledWith(mockClientOptions, BrowserToolKeysCommands.Exists, [mockAddStreamEntriesDto.keyName])
        .mockResolvedValue(true);
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolStreamCommands.XInfoStream, [mockAddStreamEntriesDto.keyName])
        .mockResolvedValue(mockStreamInfoReply);
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolStreamCommands.XRevRange, expect.anything())
        .mockResolvedValue(mockStreamEntriesReply);
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolStreamCommands.XRange, expect.anything())
        .mockResolvedValue(mockStreamEntriesReply);
    });
    it('get entries DESC', async () => {
      const result = await service.getEntries(mockClientOptions, {
        ...mockGetStreamEntriesDto,
      });
      expect(result).toEqual({
        ...mockStreamInfo,
        entries: mockStreamEntries,
      });
    });
    it('get entries ASC', async () => {
      const result = await service.getEntries(mockClientOptions, {
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
        .calledWith(mockClientOptions, BrowserToolKeysCommands.Exists, [mockAddStreamEntriesDto.keyName])
        .mockResolvedValueOnce(false);

      try {
        await service.getEntries(mockClientOptions, {
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
        .calledWith(mockClientOptions, BrowserToolKeysCommands.Exists, [mockAddStreamEntriesDto.keyName])
        .mockRejectedValueOnce(new NotFoundException(ERROR_MESSAGES.INVALID_DATABASE_INSTANCE_ID));

      try {
        await service.getEntries(mockClientOptions, {
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
        .calledWith(mockClientOptions, BrowserToolStreamCommands.XInfoStream, [mockAddStreamEntriesDto.keyName])
        .mockRejectedValueOnce(new Error(RedisErrorCodes.WrongType));

      try {
        await service.getEntries(mockClientOptions, {
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
        .calledWith(mockClientOptions, BrowserToolStreamCommands.XInfoStream, [mockAddStreamEntriesDto.keyName])
        .mockRejectedValueOnce(new Error('oO'));

      try {
        await service.getEntries(mockClientOptions, {
          ...mockGetStreamEntriesDto,
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
        expect(e.message).toEqual('oO');
      }
    });
  });
});
