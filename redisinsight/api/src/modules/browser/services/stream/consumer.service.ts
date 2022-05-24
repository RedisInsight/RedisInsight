import {
  BadRequestException, Injectable, Logger, NotFoundException,
} from '@nestjs/common';
import { IFindRedisClientInstanceByOptions } from 'src/modules/core/services/redis/redis.service';
import { RedisErrorCodes } from 'src/constants';
import { catchAclError, convertStringsArrayToObject } from 'src/utils';
import {
  BrowserToolKeysCommands, BrowserToolStreamCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { BrowserToolService } from 'src/modules/browser/services/browser-tool/browser-tool.service';
import ERROR_MESSAGES from 'src/constants/error-messages';
import {
  ConsumerDto,
  GetConsumersDto, GetPendingEntriesDto, PendingEntryDto,
} from 'src/modules/browser/dto/stream.dto';

@Injectable()
export class ConsumerService {
  private logger = new Logger('ConsumerService');

  constructor(private browserTool: BrowserToolService) {}

  /**
   * Get consumers list inside particular group
   * @param clientOptions
   * @param dto
   */
  async getConsumers(
    clientOptions: IFindRedisClientInstanceByOptions,
    dto: GetConsumersDto,
  ): Promise<ConsumerDto[]> {
    try {
      this.logger.log('Getting consumers list.');

      const exists = await this.browserTool.execCommand(
        clientOptions,
        BrowserToolKeysCommands.Exists,
        [dto.keyName],
      );

      if (!exists) {
        return Promise.reject(new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST));
      }

      return ConsumerService.formatReplyToDto(await this.browserTool.execCommand(
        clientOptions,
        BrowserToolStreamCommands.XInfoConsumers,
        [dto.keyName, dto.groupName],
      ));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error?.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }

      throw catchAclError(error);
    }
  }

  /**
   * Get list of pending messages info for particular consumer
   * @param clientOptions
   * @param dto
   */
  async getPendingMessages(
    clientOptions: IFindRedisClientInstanceByOptions,
    dto: GetPendingEntriesDto,
  ): Promise<PendingEntryDto[]> {
    try {
      this.logger.log('Getting pending messages list.');

      const exists = await this.browserTool.execCommand(
        clientOptions,
        BrowserToolKeysCommands.Exists,
        [dto.keyName],
      );

      if (!exists) {
        return Promise.reject(new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST));
      }

      return ConsumerService.formatReplyToPendingMessagesDto(await this.browserTool.execCommand(
        clientOptions,
        BrowserToolStreamCommands.XPending,
        [dto.keyName, dto.groupName, dto.start, dto.end, dto.count, dto.consumerName],
      ));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error?.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }

      throw catchAclError(error);
    }
  }

  /**
   * Converts RESP response from Redis
   * [
   *  ['name', 'consumer-1', 'pending', 0, 'idle', 258741],
   *  ['name', 'consumer-2', 'pending', 0, 'idle', 258741],
   *  ...
   * ]
   *
   * to DTO
   *
   * [
   *  {
   *    name: 'consumer-1',
   *    pending: 0,
   *    idle: 258741,
   *  },
   *  {
   *    name: 'consumer-2',
   *    pending: 0,
   *    idle: 258741,
   *  },
   *   ...
   * ]
   * @param reply
   */
  static formatReplyToDto(reply: Array<Array<string | number>>): ConsumerDto[] {
    return reply.map(ConsumerService.formatArrayToDto);
  }

  /**
   * Format single reply entry to DTO
   * @param entry
   */
  static formatArrayToDto(entry: Array<string | number>): ConsumerDto {
    if (!entry?.length) {
      return null;
    }

    const entryObj = convertStringsArrayToObject(entry as string[]);

    return {
      name: entryObj['name'],
      pending: entryObj['pending'],
      idle: entryObj['idle'],
    };
  }

  /**
   * Converts RESP response from Redis
   * [
   *  ['1567352639-0', 'consumer-1', 258741, 2],
   *  ...
   * ]
   *
   * to DTO
   *
   * [
   *  {
   *    id: '1567352639-0',
   *    name: 'consumer-1',
   *    idle: 258741,
   *    delivered: 2,
   *  },
   *   ...
   * ]
   * @param reply
   */
  static formatReplyToPendingMessagesDto(reply: Array<Array<string | number>>): PendingEntryDto[] {
    return reply.map(ConsumerService.formatArrayToPendingMessageDto);
  }

  /**
   * Format single reply entry to DTO
   * @param entry
   */
  static formatArrayToPendingMessageDto(entry: Array<string | number>): PendingEntryDto {
    if (!entry?.length) {
      return null;
    }

    return {
      id: `${entry[0]}`,
      consumerName: `${entry[1]}`,
      idle: +entry[2],
      delivered: +entry[3],
    };
  }
}
