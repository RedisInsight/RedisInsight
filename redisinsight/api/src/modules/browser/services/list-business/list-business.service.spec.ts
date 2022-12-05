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
  mockRedisWrongNumberOfArgumentsError,
  mockRedisWrongTypeError,
  mockBrowserClientMetadata,
} from 'src/__mocks__';
import {
  CreateListWithExpireDto,
  ListElementDestination,
} from 'src/modules/browser/dto';
import { BrowserToolService } from 'src/modules/browser/services/browser-tool/browser-tool.service';
import {
  BrowserToolKeysCommands,
  BrowserToolListCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import {
  mockDeleteElementsDto,
  mockGetListElementResponse,
  mockGetListElementsDto, mockGetListElementsResponse, mockIndex,
  mockKeyDto, mockListElement, mockListElement2,
  mockListElements,
  mockPushElementDto, mockSetListElementDto,
} from 'src/modules/browser/__mocks__';
import { ListBusinessService } from './list-business.service';

describe('ListBusinessService', () => {
  let service: ListBusinessService;
  let browserTool;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListBusinessService,
        {
          provide: BrowserToolService,
          useFactory: mockRedisConsumer,
        },
      ],
    }).compile();

    service = module.get<ListBusinessService>(ListBusinessService);
    browserTool = module.get<BrowserToolService>(BrowserToolService);
  });

  describe('createList', () => {
    beforeEach(() => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Exists, [
          mockPushElementDto.keyName,
        ])
        .mockResolvedValue(false);
      service.createListWithExpiration = jest.fn();
    });
    it('create list with expiration', async () => {
      service.createListWithExpiration = jest
        .fn()
        .mockResolvedValue(undefined);

      await expect(
        service.createList(mockBrowserClientMetadata, {
          ...mockPushElementDto,
          expire: 1000,
        }),
      ).resolves.not.toThrow();
      expect(service.createListWithExpiration).toHaveBeenCalled();
    });
    it('create list without expiration', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolListCommands.LPush, [
          mockPushElementDto.keyName,
          mockPushElementDto.element,
        ])
        .mockResolvedValue(1);

      await expect(
        service.createList(mockBrowserClientMetadata, mockPushElementDto),
      ).resolves.not.toThrow();
      expect(service.createListWithExpiration).not.toHaveBeenCalled();
    });
    it('key with this name exist', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Exists, [
          mockPushElementDto.keyName,
        ])
        .mockResolvedValue(true);

      await expect(
        service.createList(mockBrowserClientMetadata, mockPushElementDto),
      ).rejects.toThrow(ConflictException);
      expect(browserTool.execCommand).toHaveBeenCalledTimes(1);
      expect(browserTool.execMulti).not.toHaveBeenCalled();
    });
    it("user don't have required permissions for createList", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'LPUSH',
      };
      browserTool.execCommand.mockRejectedValue(replyError);

      await expect(
        service.createList(mockBrowserClientMetadata, mockPushElementDto),
      ).rejects.toThrow(ForbiddenException);
      expect(browserTool.execCommand).toHaveBeenCalledTimes(1);
      expect(browserTool.execMulti).not.toHaveBeenCalled();
    });
  });

  describe('pushElement', () => {
    it('succeed to insert element at the tail of the list data type', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolListCommands.RPushX, [
          mockPushElementDto.keyName,
          mockPushElementDto.element,
        ])
        .mockResolvedValue(1);

      await expect(
        service.pushElement(mockBrowserClientMetadata, mockPushElementDto),
      ).resolves.not.toThrow();
    });
    it('succeed to insert element at the head of the list data type', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolListCommands.LPushX, [
          mockPushElementDto.keyName,
          mockPushElementDto.element,
        ])
        .mockResolvedValue(12);

      const result = await service.pushElement(mockBrowserClientMetadata, {
        ...mockPushElementDto,
        destination: ListElementDestination.Head,
      });
      expect(result.keyName).toEqual(mockPushElementDto.keyName);
      expect(result.total).toEqual(12);
    });
    it('key with this name does not exist for pushElement', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolListCommands.RPushX, [
          mockPushElementDto.keyName,
          mockPushElementDto.element,
        ])
        .mockResolvedValue(0);

      await expect(
        service.pushElement(mockBrowserClientMetadata, mockPushElementDto),
      ).rejects.toThrow(NotFoundException);
    });
    it("user don't have required permissions for pushElement", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'RPUSHX',
      };
      browserTool.execCommand.mockRejectedValue(replyError);

      await expect(
        service.pushElement(mockBrowserClientMetadata, mockPushElementDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getElements', () => {
    beforeEach(() => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolListCommands.LLen, [
          mockPushElementDto.keyName,
        ])
        .mockResolvedValue(mockListElements.length);
    });
    it('succeed to get elements of the list', async () => {
      when(browserTool.execCommand)
        .calledWith(
          mockBrowserClientMetadata,
          BrowserToolListCommands.Lrange,
          expect.anything(),
        )
        .mockResolvedValue(mockListElements);

      const result = await service.getElements(
        mockBrowserClientMetadata,
        mockGetListElementsDto,
      );
      await expect(result).toEqual(mockGetListElementsResponse);
    });
    it('key with this name does not exist for getElements', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolListCommands.LLen, [
          mockPushElementDto.keyName,
        ])
        .mockResolvedValue(0);

      await expect(
        service.getElements(mockBrowserClientMetadata, mockGetListElementsDto),
      ).rejects.toThrow(NotFoundException);
    });
    it("try to use 'LLEN' command not for list data type", async () => {
      const replyError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: 'LLEN',
      };
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolListCommands.LLen, [
          mockPushElementDto.keyName,
        ])
        .mockRejectedValue(replyError);

      await expect(
        service.getElements(mockBrowserClientMetadata, mockGetListElementsDto),
      ).rejects.toThrow(BadRequestException);
    });
    it("user don't have required permissions for getElements", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'LRANGE',
      };
      browserTool.execCommand.mockRejectedValue(replyError);

      await expect(
        service.getElements(mockBrowserClientMetadata, mockGetListElementsDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getElement', () => {
    beforeEach(() => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Exists, [
          mockKeyDto.keyName,
        ])
        .mockResolvedValue(1);
    });
    it('try to use LINDEX command not for list data type', async () => {
      const replyError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: 'LINDEX',
      };
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolListCommands.LIndex, [
          mockKeyDto.keyName,
          expect.anything(),
        ])
        .mockRejectedValue(replyError);

      await expect(
        service.getElement(mockBrowserClientMetadata, mockIndex, mockKeyDto),
      ).rejects.toThrow(BadRequestException);
    });
    it("user hasn't permissions to LINDEX", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'LINDEX',
      };
      when(browserTool.execCommand)
        .calledWith(
          mockBrowserClientMetadata,
          BrowserToolListCommands.LIndex,
          expect.anything(),
        )
        .mockRejectedValue(replyError);

      await expect(
        service.getElement(mockBrowserClientMetadata, mockIndex, mockKeyDto),
      ).rejects.toThrow(ForbiddenException);
    });
    it("user hasn't permissions to EXISTS", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'EXISTS',
      };
      when(browserTool.execCommand)
        .calledWith(
          mockBrowserClientMetadata,
          BrowserToolKeysCommands.Exists,
          expect.anything(),
        )
        .mockRejectedValue(replyError);

      await expect(
        service.getElement(mockBrowserClientMetadata, mockIndex, mockKeyDto),
      ).rejects.toThrow(ForbiddenException);
    });
    it('key with this name does not exists', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Exists, [
          mockKeyDto.keyName,
        ])
        .mockResolvedValue(0);

      await expect(
        service.getElement(mockBrowserClientMetadata, mockIndex, mockKeyDto),
      ).rejects.toThrow(NotFoundException);
    });
    it('index is out of range', async () => {
      when(browserTool.execCommand)
        .calledWith(
          mockBrowserClientMetadata,
          BrowserToolListCommands.LIndex,
          expect.anything(),
        )
        .mockResolvedValue(null);

      await expect(
        service.getElement(mockBrowserClientMetadata, mockIndex, mockKeyDto),
      ).rejects.toThrow(NotFoundException);
    });
    it('succeed to get List element by index', async () => {
      when(browserTool.execCommand)
        .calledWith(
          mockBrowserClientMetadata,
          BrowserToolListCommands.LIndex,
          expect.anything(),
        )
        .mockResolvedValue(mockGetListElementResponse.value);

      const result = await service.getElement(
        mockBrowserClientMetadata,
        mockIndex,
        mockKeyDto,
      );
      await expect(result).toEqual(mockGetListElementResponse);
    });
  });

  describe('setElement', () => {
    beforeEach(() => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Exists, [
          mockSetListElementDto.keyName,
        ])
        .mockResolvedValue(true);
    });
    it('succeed to set the list element at index', async () => {
      const { keyName, index, element } = mockSetListElementDto;
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolListCommands.LSet, [
          keyName,
          index,
          element,
        ])
        .mockResolvedValue('OK');

      await expect(
        service.setElement(mockBrowserClientMetadata, mockSetListElementDto),
      ).resolves.not.toThrow();
    });
    it('key with this name does not exist for setElement', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Exists, [
          mockSetListElementDto.keyName,
        ])
        .mockResolvedValue(false);

      await expect(
        service.setElement(mockBrowserClientMetadata, mockSetListElementDto),
      ).rejects.toThrow(NotFoundException);
    });
    it("try to use 'LSET' command not for list data type", async () => {
      const replyError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: 'LSET',
      };
      browserTool.execCommand.mockRejectedValue(replyError);

      await expect(
        service.setElement(mockBrowserClientMetadata, mockSetListElementDto),
      ).rejects.toThrow(BadRequestException);
    });
    it('index for LSET coomand is of out of range', async () => {
      const replyError: ReplyError = {
        name: 'ReplyError',
        command: 'LSET',
        message: 'ERR index out of range',
      };
      browserTool.execCommand.mockRejectedValue(replyError);

      await expect(
        service.setElement(mockBrowserClientMetadata, mockSetListElementDto),
      ).rejects.toThrow(BadRequestException);
    });
    it("user don't have required permissions", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'LSET',
      };
      browserTool.execCommand.mockRejectedValue(replyError);

      await expect(
        service.setElement(mockBrowserClientMetadata, mockSetListElementDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteElements', () => {
    it('succeed to remove element from the tail', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolListCommands.RPop, [
          mockDeleteElementsDto.keyName,
        ])
        .mockResolvedValue(mockListElements[0]);

      const result = await service.deleteElements(
        mockBrowserClientMetadata,
        mockDeleteElementsDto,
      );

      await expect(result).toEqual({ elements: [mockListElements[0]] });
    });
    it('succeed to remove element from the head', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolListCommands.LPop, [
          mockDeleteElementsDto.keyName,
        ])
        .mockResolvedValue(mockListElements[0]);

      const result = await service.deleteElements(mockBrowserClientMetadata, {
        ...mockDeleteElementsDto,
        destination: ListElementDestination.Head,
      });

      await expect(result).toEqual({ elements: [mockListElements[0]] });
    });
    it('succeed to remove multiple elements from the tail', async () => {
      const mockDeletedElements = [mockListElement, mockListElement2];
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolListCommands.RPop, [
          mockDeleteElementsDto.keyName,
          2,
        ])
        .mockResolvedValue(mockDeletedElements);

      const result = await service.deleteElements(mockBrowserClientMetadata, {
        ...mockDeleteElementsDto,
        count: 2,
      });
      await expect(result).toEqual({ elements: mockDeletedElements });
    });
    it('try to use RPOP command not for list data type', async () => {
      const replyError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: 'RPOP',
      };
      when(browserTool.execCommand)
        .calledWith(
          mockBrowserClientMetadata,
          BrowserToolListCommands.RPop,
          expect.anything(),
        )
        .mockRejectedValue(replyError);

      await expect(
        service.deleteElements(mockBrowserClientMetadata, mockDeleteElementsDto),
      ).rejects.toThrow(BadRequestException);
    });
    it("redis doesn't support 'RPOP' with 'count' argument", async () => {
      const replyError: ReplyError = {
        ...mockRedisWrongNumberOfArgumentsError,
        command: {
          name: 'rpop',
          args: [mockDeleteElementsDto.keyName, 2],
        },
      };
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolListCommands.RPop, [
          mockDeleteElementsDto.keyName,
          2,
        ])
        .mockRejectedValue(replyError);

      await expect(
        service.deleteElements(mockBrowserClientMetadata, {
          ...mockDeleteElementsDto,
          count: 2,
        }),
      ).rejects.toThrow(BadRequestException);
    });
    it("user hasn't permissions to RPOP", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'RPOP',
      };
      when(browserTool.execCommand)
        .calledWith(
          mockBrowserClientMetadata,
          BrowserToolListCommands.RPop,
          expect.anything(),
        )
        .mockRejectedValue(replyError);

      await expect(
        service.deleteElements(mockBrowserClientMetadata, mockDeleteElementsDto),
      ).rejects.toThrow(ForbiddenException);
    });
    it('key with this name does not exists', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolListCommands.RPop, [
          mockDeleteElementsDto.keyName,
        ])
        .mockResolvedValue(null);

      await expect(
        service.deleteElements(mockBrowserClientMetadata, mockDeleteElementsDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('_createListWithExpiration', () => {
    const dto: CreateListWithExpireDto = {
      ...mockPushElementDto,
      expire: 1000,
    };
    it("shouldn't throw error", async () => {
      when(browserTool.execMulti)
        .calledWith(mockBrowserClientMetadata, [
          [BrowserToolListCommands.LPush, dto.keyName, dto.element],
          [BrowserToolKeysCommands.Expire, dto.keyName, dto.expire],
        ])
        .mockResolvedValue([
          null,
          [
            [null, 1],
            [null, 1],
          ],
        ]);

      await expect(
        service.createListWithExpiration(mockBrowserClientMetadata, dto),
      ).resolves.not.toThrow();
    });
    it('should throw error', async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'LPUSH',
      };
      when(browserTool.execMulti)
        .calledWith(mockBrowserClientMetadata, [
          [BrowserToolListCommands.LPush, dto.keyName, dto.element],
          [BrowserToolKeysCommands.Expire, dto.keyName, dto.expire],
        ])
        .mockResolvedValue([replyError, []]);

      try {
        await service.createListWithExpiration(mockBrowserClientMetadata, dto);
        fail('Should throw an error');
      } catch (err) {
        expect(err.message).toEqual(replyError.message);
      }
    });
  });
});
