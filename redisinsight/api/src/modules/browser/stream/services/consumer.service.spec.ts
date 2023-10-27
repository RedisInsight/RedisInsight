import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import { mockRedisConsumer, MockType, mockBrowserClientMetadata } from 'src/__mocks__';
import { BrowserToolService } from 'src/modules/browser/services/browser-tool/browser-tool.service';
import {
  BrowserToolKeysCommands, BrowserToolStreamCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import {
  BadRequestException, InternalServerErrorException, NotFoundException,
} from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { RedisErrorCodes } from 'src/constants';
import { ConsumerService } from 'src/modules/browser/stream/services/consumer.service';
import {
  mockAckPendingMessagesDto,
  mockAdditionalClaimPendingEntriesDto,
  mockClaimPendingEntriesDto,
  mockClaimPendingEntriesReply,
  mockConsumer,
  mockConsumerGroup,
  mockConsumerReply,
  mockGetPendingMessagesDto,
  mockKeyDto,
  mockPendingMessage,
  mockPendingMessageReply,
} from 'src/modules/browser/__mocks__';

describe('ConsumerService', () => {
  let service: ConsumerService;
  let browserTool: MockType<BrowserToolService>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsumerService,
        {
          provide: BrowserToolService,
          useFactory: mockRedisConsumer,
        },
      ],
    }).compile();

    service = module.get(ConsumerService);
    browserTool = module.get(BrowserToolService);

    when(browserTool.execCommand)
      .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Exists, expect.anything())
      .mockResolvedValue(true);
  });

  describe('getGroups', () => {
    beforeEach(() => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolStreamCommands.XInfoConsumers, expect.anything())
        .mockResolvedValue([mockConsumerReply, mockConsumerReply]);
    });
    it('should get consumers list', async () => {
      const consumers = await service.getConsumers(mockBrowserClientMetadata, {
        ...mockKeyDto,
        groupName: mockConsumerGroup.name,
      });
      expect(consumers).toEqual([mockConsumer, mockConsumer]);
    });
    it('should throw error when key does not exists', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Exists, expect.anything())
        .mockResolvedValueOnce(false);

      try {
        await service.getConsumers(mockBrowserClientMetadata, {
          ...mockKeyDto,
          groupName: mockConsumerGroup.name,
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
        await service.getConsumers(mockBrowserClientMetadata, {
          ...mockKeyDto,
          groupName: mockConsumerGroup.name,
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.INVALID_DATABASE_INSTANCE_ID);
      }
    });
    it('should throw Not Found error when no group', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolStreamCommands.XInfoConsumers, expect.anything())
        .mockRejectedValueOnce(new Error('NOGROUP no such group'));

      try {
        await service.getConsumers(mockBrowserClientMetadata, {
          ...mockKeyDto,
          groupName: mockConsumerGroup.name,
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.CONSUMER_GROUP_NOT_FOUND);
      }
    });
    it('should throw Wrong Type error', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolStreamCommands.XInfoConsumers, expect.anything())
        .mockRejectedValueOnce(new Error(RedisErrorCodes.WrongType));

      try {
        await service.getConsumers(mockBrowserClientMetadata, {
          ...mockKeyDto,
          groupName: mockConsumerGroup.name,
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual(RedisErrorCodes.WrongType);
      }
    });
    it('should throw Internal Server error', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolStreamCommands.XInfoConsumers, expect.anything())
        .mockRejectedValueOnce(new Error('oO'));

      try {
        await service.getConsumers(mockBrowserClientMetadata, {
          ...mockKeyDto,
          groupName: mockConsumerGroup.name,
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
        expect(e.message).toEqual('oO');
      }
    });
  });
  describe('deleteConsumers', () => {
    beforeEach(() => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Exists, expect.anything())
        .mockResolvedValue(true);
      browserTool.execMulti.mockResolvedValue([null, [[null, '123-1']]]);
    });
    it('delete consumers', async () => {
      await expect(
        service.deleteConsumers(mockBrowserClientMetadata, {
          ...mockKeyDto,
          groupName: mockConsumerGroup.name,
          consumerNames: [mockConsumer.name, mockConsumer.name],
        }),
      ).resolves.not.toThrow();
      expect(browserTool.execMulti).toHaveBeenCalledWith(mockBrowserClientMetadata, [
        [
          BrowserToolStreamCommands.XGroupDelConsumer, mockKeyDto.keyName,
          mockConsumerGroup.name, mockConsumer.name,
        ],
        [
          BrowserToolStreamCommands.XGroupDelConsumer, mockKeyDto.keyName,
          mockConsumerGroup.name, mockConsumer.name,
        ],
      ]);
    });
    it('should throw Not Found when key does not exists', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Exists, expect.anything())
        .mockResolvedValueOnce(false);

      try {
        await service.deleteConsumers(mockBrowserClientMetadata, {
          ...mockKeyDto,
          groupName: mockConsumerGroup.name,
          consumerNames: [mockConsumer.name, mockConsumer.name],
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
        await service.deleteConsumers(mockBrowserClientMetadata, {
          ...mockKeyDto,
          groupName: mockConsumerGroup.name,
          consumerNames: [mockConsumer.name, mockConsumer.name],
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.INVALID_DATABASE_INSTANCE_ID);
      }
    });
    it('should throw Not Found error when group does not exists', async () => {
      browserTool.execMulti.mockResolvedValue([new Error(RedisErrorCodes.NoGroup), [[null, '123-1']]]);

      try {
        await service.deleteConsumers(mockBrowserClientMetadata, {
          ...mockKeyDto,
          groupName: mockConsumerGroup.name,
          consumerNames: [mockConsumer.name, mockConsumer.name],
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.CONSUMER_GROUP_NOT_FOUND);
      }
    });
    it('should throw Wrong Type error', async () => {
      browserTool.execMulti.mockResolvedValue([new Error(RedisErrorCodes.WrongType), [[null, '123-1']]]);

      try {
        await service.deleteConsumers(mockBrowserClientMetadata, {
          ...mockKeyDto,
          groupName: mockConsumerGroup.name,
          consumerNames: [mockConsumer.name, mockConsumer.name],
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
        await service.deleteConsumers(mockBrowserClientMetadata, {
          ...mockKeyDto,
          groupName: mockConsumerGroup.name,
          consumerNames: [mockConsumer.name, mockConsumer.name],
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
        expect(e.message).toEqual('oO');
      }
    });
  });
  describe('getPendingEntries', () => {
    beforeEach(() => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolStreamCommands.XPending, expect.anything())
        .mockResolvedValue([mockPendingMessageReply, mockPendingMessageReply]);
    });
    it('should get consumers list', async () => {
      const consumers = await service.getPendingEntries(mockBrowserClientMetadata, mockGetPendingMessagesDto);
      expect(consumers).toEqual([mockPendingMessage, mockPendingMessage]);
      expect(browserTool.execCommand).toHaveBeenCalledWith(
        mockBrowserClientMetadata,
        BrowserToolStreamCommands.XPending,
        Object.values(mockGetPendingMessagesDto),
      );
    });
    it('should throw error when key does not exists', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Exists, expect.anything())
        .mockResolvedValueOnce(false);

      try {
        await service.getPendingEntries(mockBrowserClientMetadata, mockGetPendingMessagesDto);
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
        await service.getPendingEntries(mockBrowserClientMetadata, mockGetPendingMessagesDto);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.INVALID_DATABASE_INSTANCE_ID);
      }
    });
    it('should throw Not Found error when no group', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolStreamCommands.XPending, expect.anything())
        .mockRejectedValueOnce(new Error('NOGROUP no such group'));

      try {
        await service.getPendingEntries(mockBrowserClientMetadata, mockGetPendingMessagesDto);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.CONSUMER_GROUP_NOT_FOUND);
      }
    });
    it('should throw Wrong Type error', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolStreamCommands.XPending, expect.anything())
        .mockRejectedValueOnce(new Error(RedisErrorCodes.WrongType));

      try {
        await service.getPendingEntries(mockBrowserClientMetadata, mockGetPendingMessagesDto);
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
        await service.getPendingEntries(mockBrowserClientMetadata, mockGetPendingMessagesDto);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
        expect(e.message).toEqual('oO');
      }
    });
  });
  describe('ackPendingEntries', () => {
    beforeEach(() => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Exists, expect.anything())
        .mockResolvedValue(true);
      browserTool.execCommand.mockResolvedValue(2);
    });
    it('ack pending entries', async () => {
      const result = await service.ackPendingEntries(mockBrowserClientMetadata, mockAckPendingMessagesDto);
      expect(result).toEqual({ affected: 2 });

      expect(browserTool.execCommand).toHaveBeenCalledWith(mockBrowserClientMetadata,
        BrowserToolStreamCommands.XAck,
        [
          mockAckPendingMessagesDto.keyName,
          mockAckPendingMessagesDto.groupName,
          ...mockAckPendingMessagesDto.entries,
        ]);
    });
    it('should throw Not Found when key does not exists', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Exists, expect.anything())
        .mockResolvedValueOnce(false);

      try {
        await service.ackPendingEntries(mockBrowserClientMetadata, mockAckPendingMessagesDto);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.KEY_NOT_EXIST);
      }
    });
    it('should proxy Not Found error', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolStreamCommands.XAck, expect.anything())
        .mockRejectedValueOnce(new NotFoundException(ERROR_MESSAGES.INVALID_DATABASE_INSTANCE_ID));

      try {
        await service.ackPendingEntries(mockBrowserClientMetadata, mockAckPendingMessagesDto);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.INVALID_DATABASE_INSTANCE_ID);
      }
    });
    it('should throw Bad Request when key does not exists', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolStreamCommands.XAck, expect.anything())
        .mockRejectedValueOnce(new Error(RedisErrorCodes.WrongType));

      try {
        await service.ackPendingEntries(mockBrowserClientMetadata, mockAckPendingMessagesDto);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual(RedisErrorCodes.WrongType);
      }
    });
    it('should throw Internal Server error', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolStreamCommands.XAck, expect.anything())
        .mockRejectedValueOnce(new Error('oO'));

      try {
        await service.ackPendingEntries(mockBrowserClientMetadata, mockAckPendingMessagesDto);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
        expect(e.message).toEqual('oO');
      }
    });
  });
  describe('claimPendingEntries', () => {
    beforeEach(() => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolStreamCommands.XClaim, expect.anything(), expect.anything())
        .mockResolvedValue(mockClaimPendingEntriesReply);
    });
    it('claim pending entries', async () => {
      const result = await service.claimPendingEntries(mockBrowserClientMetadata, mockClaimPendingEntriesDto);
      expect(result).toEqual({ affected: mockClaimPendingEntriesReply });

      expect(browserTool.execCommand).toHaveBeenCalledWith(
        mockBrowserClientMetadata,
        BrowserToolStreamCommands.XClaim,
        [
          mockClaimPendingEntriesDto.keyName,
          mockClaimPendingEntriesDto.groupName,
          mockClaimPendingEntriesDto.consumerName,
          mockClaimPendingEntriesDto.minIdleTime,
          ...mockClaimPendingEntriesDto.entries,
          'justid',
        ],
        'utf8',
      );
    });
    it('claim pending entries with additional args', async () => {
      const result = await service.claimPendingEntries(mockBrowserClientMetadata, {
        ...mockClaimPendingEntriesDto,
        ...mockAdditionalClaimPendingEntriesDto,
      });
      expect(result).toEqual({ affected: mockClaimPendingEntriesReply });

      expect(browserTool.execCommand).toHaveBeenCalledWith(
        mockBrowserClientMetadata,
        BrowserToolStreamCommands.XClaim,
        [
          mockClaimPendingEntriesDto.keyName,
          mockClaimPendingEntriesDto.groupName,
          mockClaimPendingEntriesDto.consumerName,
          mockClaimPendingEntriesDto.minIdleTime,
          ...mockClaimPendingEntriesDto.entries,
          'time', mockAdditionalClaimPendingEntriesDto.time,
          'retrycount', mockAdditionalClaimPendingEntriesDto.retryCount,
          'force',
          'justid',
        ],
        'utf8',
      );
    });
    it('claim pending entries with additional args and "idle" instead of "time"', async () => {
      const result = await service.claimPendingEntries(mockBrowserClientMetadata, {
        ...mockClaimPendingEntriesDto,
        ...mockAdditionalClaimPendingEntriesDto,
        idle: 0,
      });
      expect(result).toEqual({ affected: mockClaimPendingEntriesReply });

      expect(browserTool.execCommand).toHaveBeenCalledWith(
        mockBrowserClientMetadata,
        BrowserToolStreamCommands.XClaim,
        [
          mockClaimPendingEntriesDto.keyName,
          mockClaimPendingEntriesDto.groupName,
          mockClaimPendingEntriesDto.consumerName,
          mockClaimPendingEntriesDto.minIdleTime,
          ...mockClaimPendingEntriesDto.entries,
          'idle', 0,
          'retrycount', mockAdditionalClaimPendingEntriesDto.retryCount,
          'force',
          'justid',
        ],
        'utf8',
      );
    });
    it('should throw Not Found when key does not exists', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Exists, expect.anything())
        .mockResolvedValueOnce(false);

      try {
        await service.claimPendingEntries(mockBrowserClientMetadata, mockClaimPendingEntriesDto);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.KEY_NOT_EXIST);
      }
    });
    it('should proxy Not Found error', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolStreamCommands.XClaim, expect.anything(), expect.anything())
        .mockRejectedValueOnce(new NotFoundException(ERROR_MESSAGES.INVALID_DATABASE_INSTANCE_ID));

      try {
        await service.claimPendingEntries(mockBrowserClientMetadata, mockClaimPendingEntriesDto);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.INVALID_DATABASE_INSTANCE_ID);
      }
    });
    it('should throw Bad Request when key does not exists', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolStreamCommands.XClaim, expect.anything(), expect.anything())
        .mockRejectedValueOnce(new Error(RedisErrorCodes.WrongType));

      try {
        await service.claimPendingEntries(mockBrowserClientMetadata, mockClaimPendingEntriesDto);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual(RedisErrorCodes.WrongType);
      }
    });
    it('should throw Not Found when key does not exists', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolStreamCommands.XClaim, expect.anything(), expect.anything())
        .mockRejectedValueOnce(new Error(RedisErrorCodes.NoGroup));

      try {
        await service.claimPendingEntries(mockBrowserClientMetadata, mockClaimPendingEntriesDto);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.CONSUMER_GROUP_NOT_FOUND);
      }
    });
    it('should throw Internal Server error', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolStreamCommands.XClaim, expect.anything(), expect.anything())
        .mockRejectedValueOnce(new Error('oO'));

      try {
        await service.claimPendingEntries(mockBrowserClientMetadata, mockClaimPendingEntriesDto);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
        expect(e.message).toEqual('oO');
      }
    });
  });
});
