import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { RedisErrorCodes } from 'src/constants';
import { catchAclError, catchTransactionError } from 'src/utils';
import {
  BrowserToolCommands,
  BrowserToolKeysCommands,
  BrowserToolStreamCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { BrowserToolService } from 'src/modules/browser/services/browser-tool/browser-tool.service';
import ERROR_MESSAGES from 'src/constants/error-messages';
import {
  AckPendingEntriesDto,
  AckPendingEntriesResponse,
  ClaimPendingEntriesResponse,
  ClaimPendingEntryDto,
  ConsumerDto,
  DeleteConsumersDto,
  GetConsumersDto,
  GetPendingEntriesDto,
  PendingEntryDto,
} from 'src/modules/browser/stream/stream.dto';
import { plainToClass } from 'class-transformer';
import { ClientMetadata } from 'src/common/models';

@Injectable()
export class ConsumerService {
  private logger = new Logger('ConsumerService');

  constructor(private browserTool: BrowserToolService) {}

  /**
   * Get consumers list inside particular group
   * @param clientMetadata
   * @param dto
   */
  async getConsumers(
    clientMetadata: ClientMetadata,
    dto: GetConsumersDto,
  ): Promise<ConsumerDto[]> {
    try {
      this.logger.log('Getting consumers list.');

      const exists = await this.browserTool.execCommand(
        clientMetadata,
        BrowserToolKeysCommands.Exists,
        [dto.keyName],
      );

      if (!exists) {
        return Promise.reject(new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST));
      }

      return ConsumerService.formatReplyToDto(await this.browserTool.execCommand(
        clientMetadata,
        BrowserToolStreamCommands.XInfoConsumers,
        [dto.keyName, dto.groupName],
      ));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error?.message.includes(RedisErrorCodes.NoGroup)) {
        throw new NotFoundException(ERROR_MESSAGES.CONSUMER_GROUP_NOT_FOUND);
      }

      if (error?.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }

      throw catchAclError(error);
    }
  }

  /**
   * Get consumers list inside particular group
   * @param clientMetadata
   * @param dto
   */
  async deleteConsumers(
    clientMetadata: ClientMetadata,
    dto: DeleteConsumersDto,
  ): Promise<void> {
    try {
      this.logger.log('Deleting consumers from the group.');

      const exists = await this.browserTool.execCommand(
        clientMetadata,
        BrowserToolKeysCommands.Exists,
        [dto.keyName],
      );

      if (!exists) {
        return Promise.reject(new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST));
      }

      const toolCommands: Array<[
        toolCommand: BrowserToolCommands,
        ...args: Array<string | number | Buffer>,
      ]> = dto.consumerNames.map((consumerName) => (
        [
          BrowserToolStreamCommands.XGroupDelConsumer,
          dto.keyName,
          dto.groupName,
          consumerName,
        ]
      ));

      const [
        transactionError,
        transactionResults,
      ] = await this.browserTool.execMulti(clientMetadata, toolCommands);
      catchTransactionError(transactionError, transactionResults);

      return undefined;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error?.message.includes(RedisErrorCodes.NoGroup)) {
        throw new NotFoundException(ERROR_MESSAGES.CONSUMER_GROUP_NOT_FOUND);
      }

      if (error?.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }

      throw catchAclError(error);
    }
  }

  /**
   * Get list of pending entries info for particular consumer
   * @param clientMetadata
   * @param dto
   */
  async getPendingEntries(
    clientMetadata: ClientMetadata,
    dto: GetPendingEntriesDto,
  ): Promise<PendingEntryDto[]> {
    try {
      this.logger.log('Getting pending entries list.');

      const exists = await this.browserTool.execCommand(
        clientMetadata,
        BrowserToolKeysCommands.Exists,
        [dto.keyName],
      );

      if (!exists) {
        return Promise.reject(new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST));
      }

      return ConsumerService.formatReplyToPendingEntriesDto(await this.browserTool.execCommand(
        clientMetadata,
        BrowserToolStreamCommands.XPending,
        [dto.keyName, dto.groupName, dto.start, dto.end, dto.count, dto.consumerName],
      ));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error?.message.includes(RedisErrorCodes.NoGroup)) {
        throw new NotFoundException(ERROR_MESSAGES.CONSUMER_GROUP_NOT_FOUND);
      }

      if (error?.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }

      throw catchAclError(error);
    }
  }

  /**
   * Acknowledge pending entries
   * @param clientMetadata
   * @param dto
   */
  async ackPendingEntries(
    clientMetadata: ClientMetadata,
    dto: AckPendingEntriesDto,
  ): Promise<AckPendingEntriesResponse> {
    try {
      this.logger.log('Acknowledging pending entries.');

      const exists = await this.browserTool.execCommand(
        clientMetadata,
        BrowserToolKeysCommands.Exists,
        [dto.keyName],
      );

      if (!exists) {
        return Promise.reject(new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST));
      }

      const affected = await this.browserTool.execCommand(
        clientMetadata,
        BrowserToolStreamCommands.XAck,
        [dto.keyName, dto.groupName, ...dto.entries],
      );

      this.logger.log('Successfully acknowledged pending entries.');

      return {
        affected,
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
   * Claim pending entries with additional parameters
   * @param clientMetadata
   * @param dto
   */
  async claimPendingEntries(
    clientMetadata: ClientMetadata,
    dto: ClaimPendingEntryDto,
  ): Promise<ClaimPendingEntriesResponse> {
    try {
      this.logger.log('Claiming pending entries.');

      const exists = await this.browserTool.execCommand(
        clientMetadata,
        BrowserToolKeysCommands.Exists,
        [dto.keyName],
      );

      if (!exists) {
        return Promise.reject(new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST));
      }

      const args = [dto.keyName, dto.groupName, dto.consumerName, dto.minIdleTime, ...dto.entries];

      if (dto.idle !== undefined) {
        args.push('idle', dto.idle);
      } else if (dto.time !== undefined) {
        args.push('time', dto.time);
      }

      if (dto.retryCount !== undefined) {
        args.push('retrycount', dto.retryCount);
      }

      if (dto.force) {
        args.push('force');
      }

      // Return just an array of IDs of messages successfully claimed, without returning the actual message.
      args.push('justid');

      const affected = await this.browserTool.execCommand(
        clientMetadata,
        BrowserToolStreamCommands.XClaim,
        args,
        'utf8',
      );

      this.logger.log('Successfully claimed pending entries.');

      return {
        affected,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error?.message.includes(RedisErrorCodes.NoGroup)) {
        throw new NotFoundException(ERROR_MESSAGES.CONSUMER_GROUP_NOT_FOUND);
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

    const [,name,,pending,,idle] = entry;

    return plainToClass(ConsumerDto, {
      name,
      pending,
      idle,
    });
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
  static formatReplyToPendingEntriesDto(reply: Array<Array<string | number>>): PendingEntryDto[] {
    return reply.map(ConsumerService.formatArrayToPendingEntryDto);
  }

  /**
   * Format single reply entry to DTO
   * @param entry
   */
  static formatArrayToPendingEntryDto(entry: Array<string | number>): PendingEntryDto {
    if (!entry?.length) {
      return null;
    }

    return plainToClass(PendingEntryDto, {
      id: `${entry[0]}`,
      consumerName: entry[1],
      idle: +entry[2],
      delivered: +entry[3],
    });
  }
}
