import { chunk, flatMap, map } from 'lodash';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { catchAclError, catchTransactionError } from 'src/utils';
import { SortOrder } from 'src/constants/sort';
import { BrowserToolService } from 'src/modules/browser/services/browser-tool/browser-tool.service';
import {
  BrowserToolCommands,
  BrowserToolKeysCommands,
  BrowserToolStreamCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import {
  AddStreamEntriesDto,
  AddStreamEntriesResponse,
  CreateStreamDto,
  GetStreamEntriesDto,
  GetStreamEntriesResponse,
  DeleteStreamEntriesDto,
  DeleteStreamEntriesResponse,
  StreamEntryDto,
  StreamEntryFieldDto,
} from 'src/modules/browser/stream/stream.dto';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { RedisErrorCodes } from 'src/constants';
import { plainToClass } from 'class-transformer';
import { ClientMetadata } from 'src/common/models';

@Injectable()
export class StreamService {
  private logger = new Logger('StreamService');

  constructor(private browserTool: BrowserToolService) {}

  /**
   * Get stream entries
   * Could be used for lazy loading with "start", "end" and "count" parameters
   * Could be sorted using "sortOrder" in ASC and DESC order
   *
   * @param clientMetadata
   * @param dto
   */
  public async getEntries(
    clientMetadata: ClientMetadata,
    dto: GetStreamEntriesDto,
  ): Promise<GetStreamEntriesResponse> {
    try {
      this.logger.log('Getting entries of the Stream data type stored at key.');

      const { keyName, sortOrder } = dto;

      const exists = await this.browserTool.execCommand(
        clientMetadata,
        BrowserToolKeysCommands.Exists,
        [keyName],
      );

      if (!exists) {
        throw new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST);
      }

      const info = await this.browserTool.execCommand(
        clientMetadata,
        BrowserToolStreamCommands.XInfoStream,
        [keyName],
      );

      let entries = [];
      if (sortOrder && sortOrder === SortOrder.Asc) {
        entries = await this.getRange(clientMetadata, dto);
      } else {
        entries = await this.getRevRange(clientMetadata, dto);
      }

      this.logger.log('Succeed to get entries from the stream.');

      return plainToClass(GetStreamEntriesResponse, {
        keyName,
        total: info[1],
        lastGeneratedId: info[7].toString(),
        firstEntry: StreamService.formatArrayToDto(info[11]),
        lastEntry: StreamService.formatArrayToDto(info[13]),
        entries,
      });
    } catch (error) {
      this.logger.error('Failed to get entries from the stream.', error);

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
   * Return specified number of entries in the time range in ASC order
   *
   * @param clientMetadata
   * @param dto
   */
  public async getRange(
    clientMetadata: ClientMetadata,
    dto: GetStreamEntriesDto,
  ): Promise<StreamEntryDto[]> {
    const {
      keyName, start, end, count,
    } = dto;

    const execResult = await this.browserTool.execCommand(
      clientMetadata,
      BrowserToolStreamCommands.XRange,
      [keyName, start, end, 'COUNT', count],
    );

    return StreamService.formatReplyToDto(execResult);
  }

  /**
   * Return specified number of entries in the time range in DESC order
   *
   * @param clientMetadata
   * @param dto
   */
  public async getRevRange(
    clientMetadata: ClientMetadata,
    dto: GetStreamEntriesDto,
  ): Promise<StreamEntryDto[]> {
    const {
      keyName, start, end, count,
    } = dto;

    const execResult = await this.browserTool.execCommand(
      clientMetadata,
      BrowserToolStreamCommands.XRevRange,
      [keyName, end, start, 'COUNT', count],
    );

    return StreamService.formatReplyToDto(execResult);
  }

  /**
   * Create streams with\without expiration time and add multiple entries in a transaction
   * @param clientMetadata
   * @param dto
   */
  public async createStream(
    clientMetadata: ClientMetadata,
    dto: CreateStreamDto,
  ): Promise<void> {
    this.logger.log('Creating stream data type.');

    try {
      const { keyName, entries } = dto;

      const isExist = await this.browserTool.execCommand(
        clientMetadata,
        BrowserToolKeysCommands.Exists,
        [keyName],
      );
      if (isExist) {
        this.logger.error(
          `Failed to create stream data type. ${ERROR_MESSAGES.KEY_NAME_EXIST} key: ${keyName}`,
        );
        return Promise.reject(
          new ConflictException(ERROR_MESSAGES.KEY_NAME_EXIST),
        );
      }

      const entriesArray = entries.map((entry) => [
        entry.id,
        ...flatMap(map(entry.fields, (field) => [field.name, field.value])),
      ]);

      const toolCommands: Array<[
        toolCommand: BrowserToolCommands,
        ...args: Array<string | number | Buffer>,
      ]> = entriesArray.map((entry) => (
        [
          BrowserToolStreamCommands.XAdd,
          keyName,
          ...entry,
        ]
      ));

      if (dto.expire) {
        toolCommands.push([BrowserToolKeysCommands.Expire, keyName, dto.expire]);
      }

      const [
        transactionError,
        transactionResults,
      ] = await this.browserTool.execMulti(clientMetadata, toolCommands);
      catchTransactionError(transactionError, transactionResults);

      this.logger.log('Succeed to create stream.');

      return undefined;
    } catch (error) {
      this.logger.error('Failed to create stream.', error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (
        error?.message.includes(RedisErrorCodes.WrongType)
        || error?.message.includes('ID specified in XADD is equal or smaller')
      ) {
        throw new BadRequestException(error.message);
      }

      throw catchAclError(error);
    }
  }

  /**
   * Add entries to the existing stream and return entries IDs list
   * @param clientMetadata
   * @param dto
   */
  public async addEntries(
    clientMetadata: ClientMetadata,
    dto: AddStreamEntriesDto,
  ): Promise<AddStreamEntriesResponse> {
    this.logger.log('Adding entries to stream.');

    try {
      const { keyName, entries } = dto;

      const exists = await this.browserTool.execCommand(
        clientMetadata,
        BrowserToolKeysCommands.Exists,
        [keyName],
      );

      if (!exists) {
        throw new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST);
      }

      const entriesArray = entries.map((entry) => [
        entry.id,
        ...flatMap(map(entry.fields, (field) => [field.name, field.value])),
      ]);

      const toolCommands: Array<[
        toolCommand: BrowserToolCommands,
        ...args: Array<string | number | Buffer>,
      ]> = entriesArray.map((entry) => (
        [
          BrowserToolStreamCommands.XAdd,
          keyName,
          ...entry,
        ]
      ));

      const [
        transactionError,
        transactionResults,
      ] = await this.browserTool.execMulti(clientMetadata, toolCommands);
      catchTransactionError(transactionError, transactionResults);

      this.logger.log('Succeed to add entries to the stream.');

      return plainToClass(AddStreamEntriesResponse, {
        keyName,
        entries: transactionResults.map((entryResult) => entryResult[1]),
      });
    } catch (error) {
      this.logger.error('Failed to add entries to the stream.', error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (
        error?.message.includes(RedisErrorCodes.WrongType)
        || error?.message.includes('ID specified in XADD is equal or smaller')
      ) {
        throw new BadRequestException(error.message);
      }

      throw catchAclError(error);
    }
  }

  /**
 * Delete entries from the existing stream and return number of deleted entries
 * @param clientMetadata
 * @param dto
 */
  public async deleteEntries(
    clientMetadata: ClientMetadata,
    dto: DeleteStreamEntriesDto,
  ): Promise<DeleteStreamEntriesResponse> {
    this.logger.log('Deleting entries from the Stream data type.');
    const { keyName, entries } = dto;
    let result;
    try {
      const isExist = await this.browserTool.execCommand(
        clientMetadata,
        BrowserToolKeysCommands.Exists,
        [keyName],
      );
      if (!isExist) {
        this.logger.error(
          `Failed to delete entries from the Stream data type. ${ERROR_MESSAGES.KEY_NOT_EXIST} key: ${keyName}`,
        );
        return Promise.reject(
          new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST),
        );
      }
      result = await this.browserTool.execCommand(
        clientMetadata,
        BrowserToolStreamCommands.XDel,
        [keyName, ...entries],
      );
    } catch (error) {
      this.logger.error('Failed to delete entries from the Stream data type.', error);
      if (error?.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      catchAclError(error);
    }
    this.logger.log('Succeed to delete entries from the Stream data type.');
    return { affected: result };
  }

  /**
   * Converts RESP response from Redis
   * [
   *   [ '1650985323741-0', [ 'field', 'value' ] ],
   *   [ '1650985351882-0', [ 'field', 'value2' ] ],
   *   ...
   * ]
   *
   * to DTO
   *
   * [
   *   { id: '1650985323741-0', fields: [ ['field', 'value'] ] },
   *   { id: '1650985351882-0', fields: [ ['field', 'value2 ] },
   *   ...
   * ]
   * @param reply
   */
  static formatReplyToDto(reply: Array<string | string[]>): StreamEntryDto[] {
    return reply.map(StreamService.formatArrayToDto);
  }

  /**
   * Format single reply entry to DTO
   * @param entry
   */
  static formatArrayToDto(entry: Array<string>): StreamEntryDto {
    if (!entry?.length) {
      return null;
    }

    return {
      id: entry[0].toString(),
      fields: chunk(entry[1] || [], 2).map((field) => plainToClass(
        StreamEntryFieldDto,
        {
          name: field[0],
          value: field[1],
        },
      )),
    };
  }
}
