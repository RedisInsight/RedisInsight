import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import { mockRedisConsumer, MockType, mockBrowserClientMetadata } from 'src/__mocks__';
import { BrowserToolService } from 'src/modules/browser/services/browser-tool/browser-tool.service';
import {
  BrowserToolKeysCommands, BrowserToolStreamCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import {
  BadRequestException, ConflictException, InternalServerErrorException, NotFoundException,
} from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { RedisErrorCodes } from 'src/constants';
import { ConsumerGroupService } from 'src/modules/browser/stream/services/consumer-group/consumer-group.service';
import {
  mockAddStreamEntriesDto,
  mockConsumerGroup,
  mockConsumerGroupsReply,
  mockCreateConsumerGroupDto,
  mockKeyDto,
} from 'src/modules/browser/__mocks__';

describe('ConsumerGroupService', () => {
  let service: ConsumerGroupService;
  let browserTool: MockType<BrowserToolService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsumerGroupService,
        {
          provide: BrowserToolService,
          useFactory: mockRedisConsumer,
        },
      ],
    }).compile();

    service = module.get(ConsumerGroupService);
    browserTool = module.get(BrowserToolService);

    when(browserTool.execCommand)
      .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Exists, expect.anything())
      .mockResolvedValue(true);
  });

  describe('getGroups', () => {
    beforeEach(() => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolStreamCommands.XInfoGroups, expect.anything())
        .mockResolvedValue([mockConsumerGroupsReply, mockConsumerGroupsReply]);
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolStreamCommands.XPending, expect.anything())
        .mockResolvedValue(['s', mockConsumerGroup.smallestPendingId, mockConsumerGroup.greatestPendingId]);
    });
    it('should get consumer groups with info', async () => {
      const groups = await service.getGroups(mockBrowserClientMetadata, mockKeyDto);
      expect(groups).toEqual([mockConsumerGroup, mockConsumerGroup]);
    });
    it('should throw error when key does not exists', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Exists, expect.anything())
        .mockResolvedValueOnce(false);

      try {
        await service.getGroups(mockBrowserClientMetadata, mockKeyDto);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.KEY_NOT_EXIST);
      }
    });
    it('should throw Not Found error', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Exists, expect.anything())
        .mockRejectedValueOnce(new NotFoundException(ERROR_MESSAGES.INVALID_DATABASE_INSTANCE_ID));

      try {
        await service.getGroups(mockBrowserClientMetadata, mockKeyDto);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.INVALID_DATABASE_INSTANCE_ID);
      }
    });
    it('should throw Wrong Type error', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolStreamCommands.XPending, expect.anything())
        .mockRejectedValueOnce(new Error(RedisErrorCodes.WrongType));

      try {
        await service.getGroups(mockBrowserClientMetadata, {
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
        .calledWith(mockBrowserClientMetadata, BrowserToolStreamCommands.XPending, expect.anything())
        .mockRejectedValueOnce(new Error('oO'));

      try {
        await service.getGroups(mockBrowserClientMetadata, {
          ...mockAddStreamEntriesDto,
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
        expect(e.message).toEqual('oO');
      }
    });
  });
  describe('createGroups', () => {
    beforeEach(() => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Exists, expect.anything())
        .mockResolvedValue(true);
      browserTool.execMulti.mockResolvedValue([null, [[null, '123-1']]]);
    });
    it('add groups', async () => {
      await expect(
        service.createGroups(mockBrowserClientMetadata, {
          ...mockKeyDto,
          consumerGroups: [mockCreateConsumerGroupDto, mockCreateConsumerGroupDto],
        }),
      ).resolves.not.toThrow();
      expect(browserTool.execMulti).toHaveBeenCalledWith(mockBrowserClientMetadata, [
        [
          BrowserToolStreamCommands.XGroupCreate, mockKeyDto.keyName,
          mockConsumerGroup.name, mockConsumerGroup.lastDeliveredId,
        ],
        [
          BrowserToolStreamCommands.XGroupCreate, mockKeyDto.keyName,
          mockConsumerGroup.name, mockConsumerGroup.lastDeliveredId,
        ],
      ]);
    });
    it('should throw Not Found when key does not exists', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Exists, expect.anything())
        .mockResolvedValueOnce(false);

      try {
        await service.createGroups(mockBrowserClientMetadata, {
          ...mockKeyDto,
          consumerGroups: [mockCreateConsumerGroupDto, mockCreateConsumerGroupDto],
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.KEY_NOT_EXIST);
      }
    });
    it('should throw Not Found error', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Exists, expect.anything())
        .mockRejectedValueOnce(new NotFoundException(ERROR_MESSAGES.INVALID_DATABASE_INSTANCE_ID));

      try {
        await service.createGroups(mockBrowserClientMetadata, {
          ...mockKeyDto,
          consumerGroups: [mockCreateConsumerGroupDto, mockCreateConsumerGroupDto],
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
        await service.createGroups(mockBrowserClientMetadata, {
          ...mockKeyDto,
          consumerGroups: [mockCreateConsumerGroupDto, mockCreateConsumerGroupDto],
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual(RedisErrorCodes.WrongType);
      }
    });
    it('should throw Conflict when trying to create existing group', async () => {
      browserTool.execMulti.mockResolvedValue([
        new Error('BUSYGROUP such group already there!'),
        [[null, '123-1']],
      ]);

      try {
        await service.createGroups(mockBrowserClientMetadata, {
          ...mockKeyDto,
          consumerGroups: [mockCreateConsumerGroupDto, mockCreateConsumerGroupDto],
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(ConflictException);
        expect(e.message).toEqual('BUSYGROUP such group already there!');
      }
    });
    it('should throw Internal Server error', async () => {
      browserTool.execMulti.mockResolvedValue([
        new Error('oO'),
        [[null, '123-1']],
      ]);

      try {
        await service.createGroups(mockBrowserClientMetadata, {
          ...mockKeyDto,
          consumerGroups: [mockCreateConsumerGroupDto, mockCreateConsumerGroupDto],
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
        expect(e.message).toEqual('oO');
      }
    });
  });
  describe('updateGroup', () => {
    beforeEach(() => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolStreamCommands.XGroupSetId, expect.anything())
        .mockResolvedValue('OK');
    });
    it('update group', async () => {
      await expect(
        service.updateGroup(mockBrowserClientMetadata, {
          ...mockKeyDto,
          ...mockCreateConsumerGroupDto,
        }),
      ).resolves.not.toThrow();
      expect(browserTool.execCommand).toHaveBeenCalledWith(
        mockBrowserClientMetadata,
        BrowserToolStreamCommands.XGroupSetId,
        [mockKeyDto.keyName, mockCreateConsumerGroupDto.name, mockCreateConsumerGroupDto.lastDeliveredId],
      );
    });
    it('should throw Not Found when key does not exists', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Exists, expect.anything())
        .mockResolvedValueOnce(false);

      try {
        await service.updateGroup(mockBrowserClientMetadata, {
          ...mockKeyDto,
          ...mockCreateConsumerGroupDto,
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.KEY_NOT_EXIST);
      }
    });
    it('should throw Not Found error', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Exists, expect.anything())
        .mockRejectedValueOnce(new NotFoundException(ERROR_MESSAGES.INVALID_DATABASE_INSTANCE_ID));

      try {
        await service.updateGroup(mockBrowserClientMetadata, {
          ...mockKeyDto,
          ...mockCreateConsumerGroupDto,
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.INVALID_DATABASE_INSTANCE_ID);
      }
    });
    it('should throw Wrong Type error', async () => {
      browserTool.execCommand.mockRejectedValueOnce(new Error(RedisErrorCodes.WrongType));

      try {
        await service.updateGroup(mockBrowserClientMetadata, {
          ...mockKeyDto,
          ...mockCreateConsumerGroupDto,
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual(RedisErrorCodes.WrongType);
      }
    });
    it('should throw NotFound when trying to modify not-existing group', async () => {
      browserTool.execCommand.mockRejectedValueOnce(new Error('NOGROUP no such group'));

      try {
        await service.updateGroup(mockBrowserClientMetadata, {
          ...mockKeyDto,
          ...mockCreateConsumerGroupDto,
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.CONSUMER_GROUP_NOT_FOUND);
      }
    });
    it('should throw Internal Server error', async () => {
      browserTool.execCommand.mockRejectedValueOnce(new Error('oO'));

      try {
        await service.updateGroup(mockBrowserClientMetadata, {
          ...mockKeyDto,
          ...mockCreateConsumerGroupDto,
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
        expect(e.message).toEqual('oO');
      }
    });
  });
  describe('deleteGroups', () => {
    beforeEach(() => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Exists, expect.anything())
        .mockResolvedValue(true);
      browserTool.execMulti.mockResolvedValue([null, [[null, '123-1']]]);
    });
    it('add groups', async () => {
      await expect(
        service.deleteGroup(mockBrowserClientMetadata, {
          ...mockKeyDto,
          consumerGroups: [mockCreateConsumerGroupDto.name, mockCreateConsumerGroupDto.name],
        }),
      ).resolves.not.toThrow();
      expect(browserTool.execMulti).toHaveBeenCalledWith(mockBrowserClientMetadata, [
        [BrowserToolStreamCommands.XGroupDestroy, mockKeyDto.keyName, mockConsumerGroup.name],
        [BrowserToolStreamCommands.XGroupDestroy, mockKeyDto.keyName, mockConsumerGroup.name],
      ]);
    });
    it('should throw Not Found when key does not exists', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Exists, expect.anything())
        .mockResolvedValueOnce(false);

      try {
        await service.deleteGroup(mockBrowserClientMetadata, {
          ...mockKeyDto,
          consumerGroups: [mockCreateConsumerGroupDto.name, mockCreateConsumerGroupDto.name],
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.KEY_NOT_EXIST);
      }
    });
    it('should throw Not Found error', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Exists, expect.anything())
        .mockRejectedValueOnce(new NotFoundException(ERROR_MESSAGES.INVALID_DATABASE_INSTANCE_ID));

      try {
        await service.deleteGroup(mockBrowserClientMetadata, {
          ...mockKeyDto,
          consumerGroups: [mockCreateConsumerGroupDto.name, mockCreateConsumerGroupDto.name],
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
        await service.deleteGroup(mockBrowserClientMetadata, {
          ...mockKeyDto,
          consumerGroups: [mockCreateConsumerGroupDto.name, mockCreateConsumerGroupDto.name],
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual(RedisErrorCodes.WrongType);
      }
    });
    it('should throw Internal Server error', async () => {
      browserTool.execMulti.mockResolvedValue([
        new Error('oO'),
        [[null, '123-1']],
      ]);

      try {
        await service.deleteGroup(mockBrowserClientMetadata, {
          ...mockKeyDto,
          consumerGroups: [mockCreateConsumerGroupDto.name, mockCreateConsumerGroupDto.name],
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
        expect(e.message).toEqual('oO');
      }
    });
  });
});
