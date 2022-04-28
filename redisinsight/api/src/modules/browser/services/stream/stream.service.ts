import { chunk } from 'lodash';
import {
  BadRequestException,
  Injectable,
  Logger, NotFoundException,
} from '@nestjs/common';
import { catchAclError, convertStringsArrayToObject } from 'src/utils';
import { SortOrder } from 'src/constants/sort';
import { IFindRedisClientInstanceByOptions } from 'src/modules/core/services/redis/redis.service';
import { BrowserToolService } from 'src/modules/browser/services/browser-tool/browser-tool.service';
import {
  BrowserToolKeysCommands,
  BrowserToolStreamCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { GetStreamEntriesDto, GetStreamEntriesResponse, StreamEntryDto } from 'src/modules/browser/dto/stream.dto';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { RedisErrorCodes } from 'src/constants';

@Injectable()
export class StreamService {
  private logger = new Logger('StreamService');

  constructor(private browserTool: BrowserToolService) {}

  /**
   * Get stream entries
   * Could be used for lazy loading with "start", "end" and "count" parameters
   * Could be sorted using "sortOrder" in ASC and DESC order
   *
   * @param clientOptions
   * @param dto
   */
  public async getEntries(
    clientOptions: IFindRedisClientInstanceByOptions,
    dto: GetStreamEntriesDto,
  ): Promise<GetStreamEntriesResponse> {
    try {
      this.logger.log('Getting entries of the Stream data type stored at key.');

      const { keyName, sortOrder } = dto;

      const exists = await this.browserTool.execCommand(
        clientOptions,
        BrowserToolKeysCommands.Exists,
        [keyName],
      );

      if (!exists) {
        throw new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST);
      }

      const info = convertStringsArrayToObject(await this.browserTool.execCommand(
        clientOptions,
        BrowserToolStreamCommands.XInfoStream,
        [keyName],
      ));

      let entries = [];
      if (sortOrder && sortOrder === SortOrder.Asc) {
        entries = await this.getRange(clientOptions, dto);
      } else {
        entries = await this.getRevRange(clientOptions, dto);
      }

      this.logger.log('Succeed to get entries from the stream.');

      return {
        keyName,
        total: info.length,
        lastGeneratedId: info['last-generated-id'],
        firstEntry: StreamService.formatReplyToDto([info['first-entry']])[0],
        lastEntry: StreamService.formatReplyToDto([info['last-entry']])[0],
        entries,
      };
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
   * @param clientOptions
   * @param dto
   */
  public async getRange(
    clientOptions: IFindRedisClientInstanceByOptions,
    dto: GetStreamEntriesDto,
  ): Promise<StreamEntryDto[]> {
    const {
      keyName, start, end, count,
    } = dto;

    const execResult = await this.browserTool.execCommand(
      clientOptions,
      BrowserToolStreamCommands.XRange,
      [keyName, start, end, 'COUNT', count],
    );

    return StreamService.formatReplyToDto(execResult);
  }

  /**
   * Return specified number of entries in the time range in DESC order
   *
   * @param clientOptions
   * @param dto
   */
  public async getRevRange(
    clientOptions: IFindRedisClientInstanceByOptions,
    dto: GetStreamEntriesDto,
  ): Promise<StreamEntryDto[]> {
    const {
      keyName, start, end, count,
    } = dto;

    const execResult = await this.browserTool.execCommand(
      clientOptions,
      BrowserToolStreamCommands.XRevRange,
      [keyName, end, start, 'COUNT', count],
    );

    return StreamService.formatReplyToDto(execResult);
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
   *   { id: '1650985323741-0', fields: { field: 'value' } },
   *   { id: '1650985351882-0', fields: { field: 'value2' } },
   *   ...
   * ]
   * @param reply
   */
  static formatReplyToDto(reply: Array<string | string[]>): StreamEntryDto[] {
    return reply.map((entry) => {
      const dto = { id: entry[0], fields: {} };

      chunk(entry[1] || [], 2).forEach((keyFieldPair) => {
        // eslint-disable-next-line prefer-destructuring
        dto.fields[keyFieldPair[0]] = keyFieldPair[1];
      });

      return dto;
    });
  }
}
