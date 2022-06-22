import {
  BadRequestException, ConflictException, Injectable, Logger, NotFoundException,
} from '@nestjs/common';
import { IFindRedisClientInstanceByOptions } from 'src/modules/core/services/redis/redis.service';
import { RedisErrorCodes } from 'src/constants';
import { catchAclError, catchTransactionError, convertStringsArrayToObject } from 'src/utils';
import {
  BrowserToolCommands,
  BrowserToolKeysCommands, BrowserToolStreamCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { BrowserToolService } from 'src/modules/browser/services/browser-tool/browser-tool.service';
import { KeyDto } from 'src/modules/browser/dto';
import ERROR_MESSAGES from 'src/constants/error-messages';
import {
  ConsumerGroupDto,
  CreateConsumerGroupsDto,
  DeleteConsumerGroupsDto, DeleteConsumerGroupsResponse,
  UpdateConsumerGroupDto,
} from 'src/modules/browser/dto/stream.dto';

@Injectable()
export class ConsumerGroupService {
  private logger = new Logger('ConsumerGroupService');

  constructor(private browserTool: BrowserToolService) {}

  /**
   * Get consumer groups list for particular stream
   * In addition fetch pending messages info for each group
   * !May be slow on huge streams as 'XPENDING' command tagged with as @slow
   * @param clientOptions
   * @param dto
   */
  async getGroups(
    clientOptions: IFindRedisClientInstanceByOptions,
    dto: KeyDto,
  ): Promise<ConsumerGroupDto[]> {
    try {
      this.logger.log('Getting consumer groups list.');

      const exists = await this.browserTool.execCommand(
        clientOptions,
        BrowserToolKeysCommands.Exists,
        [dto.keyName],
      );

      if (!exists) {
        return Promise.reject(new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST));
      }

      const groups = ConsumerGroupService.formatReplyToDto(await this.browserTool.execCommand(
        clientOptions,
        BrowserToolStreamCommands.XInfoGroups,
        [dto.keyName],
      ));

      return await Promise.all(groups.map((group) => this.getGroupInfo(
        clientOptions,
        dto,
        group,
      )));
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
   * Get consumer group pending info using 'XPENDING' command
   * @param clientOptions
   * @param dto
   * @param group
   */
  async getGroupInfo(
    clientOptions: IFindRedisClientInstanceByOptions,
    dto: KeyDto,
    group: ConsumerGroupDto,
  ): Promise<ConsumerGroupDto> {
    const info = await this.browserTool.execCommand(
      clientOptions,
      BrowserToolStreamCommands.XPending,
      [dto.keyName, group.name],
    );

    return {
      ...group,
      smallestPendingId: info?.[1] || null,
      greatestPendingId: info?.[2] || null,
    };
  }

  /**
   * Create consumer group(s)
   * @param clientOptions
   * @param dto
   */
  async createGroups(
    clientOptions: IFindRedisClientInstanceByOptions,
    dto: CreateConsumerGroupsDto,
  ): Promise<void> {
    try {
      this.logger.log('Creating consumer groups.');
      const { keyName, consumerGroups } = dto;

      const exists = await this.browserTool.execCommand(
        clientOptions,
        BrowserToolKeysCommands.Exists,
        [keyName],
      );

      if (!exists) {
        return Promise.reject(new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST));
      }

      const toolCommands: Array<[
        toolCommand: BrowserToolCommands,
        ...args: Array<string | number>,
      ]> = consumerGroups.map((group) => (
        [
          BrowserToolStreamCommands.XGroupCreate,
          keyName,
          group.name,
          group.lastDeliveredId,
        ]
      ));

      const [
        transactionError,
        transactionResults,
      ] = await this.browserTool.execMulti(clientOptions, toolCommands);
      catchTransactionError(transactionError, transactionResults);

      this.logger.log('Stream consumer group(s) created.');

      return undefined;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error?.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }

      if (error?.message.includes(RedisErrorCodes.BusyGroup)) {
        throw new ConflictException(error.message);
      }

      throw catchAclError(error);
    }
  }

  /**
   * Updates last delivered id for Consumer Group
   * @param clientOptions
   * @param dto
   */
  async updateGroup(
    clientOptions: IFindRedisClientInstanceByOptions,
    dto: UpdateConsumerGroupDto,
  ): Promise<void> {
    try {
      this.logger.log('Updating consumer group.');

      const exists = await this.browserTool.execCommand(
        clientOptions,
        BrowserToolKeysCommands.Exists,
        [dto.keyName],
      );

      if (!exists) {
        return Promise.reject(new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST));
      }

      await this.browserTool.execCommand(
        clientOptions,
        BrowserToolStreamCommands.XGroupSetId,
        [dto.keyName, dto.name, dto.lastDeliveredId],
      );

      this.logger.log('Consumer group was updated.');

      return undefined;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error?.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }

      if (error?.message.includes(RedisErrorCodes.NoGroup)) {
        throw new NotFoundException(ERROR_MESSAGES.CONSUMER_GROUP_NOT_FOUND);
      }

      throw catchAclError(error);
    }
  }

  /**
   * Delete consumer groups in batch
   * @param clientOptions
   * @param dto
   */
  async deleteGroup(
    clientOptions: IFindRedisClientInstanceByOptions,
    dto: DeleteConsumerGroupsDto,
  ): Promise<DeleteConsumerGroupsResponse> {
    try {
      this.logger.log('Deleting consumer group.');

      const exists = await this.browserTool.execCommand(
        clientOptions,
        BrowserToolKeysCommands.Exists,
        [dto.keyName],
      );

      if (!exists) {
        return Promise.reject(new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST));
      }

      const toolCommands: Array<[
        toolCommand: BrowserToolCommands,
        ...args: Array<string | number>,
      ]> = dto.consumerGroups.map((group) => (
        [
          BrowserToolStreamCommands.XGroupDestroy,
          dto.keyName,
          group,
        ]
      ));

      const [
        transactionError,
        transactionResults,
      ] = await this.browserTool.execMulti(clientOptions, toolCommands);
      catchTransactionError(transactionError, transactionResults);

      this.logger.log('Consumer group(s) successfully deleted.');

      return {
        affected: toolCommands.length,
      };
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
   *  ['name', 'g1', 'consumers', 0, 'pending', 0, 'last-delivered-id', '1653034260278-0'],
   *  ['name', 'g2', 'consumers', 0, 'pending', 0, 'last-delivered-id', '1653034260278-0'],
   *  ...
   * ]
   *
   * to DTO
   *
   * [
   *  {
   *    name: 'g1',
   *    consumers: 0,
   *    pending: 0,
   *    lastDeliveredId: '1653034260278-0'
   *  },
   *  {
   *    name: 'g2',
   *    consumers: 0,
   *    pending: 0,
   *    lastDeliveredId: '1653034260278-0'
   *  },
   *   ...
   * ]
   * @param reply
   */
  static formatReplyToDto(reply: Array<Array<string | number>>): ConsumerGroupDto[] {
    return reply.map(ConsumerGroupService.formatArrayToDto);
  }

  /**
   * Format single reply entry to DTO
   * @param entry
   */
  static formatArrayToDto(entry: Array<string | number>): ConsumerGroupDto {
    if (!entry?.length) {
      return null;
    }
    const entryObj = convertStringsArrayToObject(entry as string[]);

    return {
      name: entryObj['name'],
      consumers: entryObj['consumers'],
      pending: entryObj['pending'],
      lastDeliveredId: entryObj['last-delivered-id'],
      smallestPendingId: null,
      greatestPendingId: null,
    };
  }
}
