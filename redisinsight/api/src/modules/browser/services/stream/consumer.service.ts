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
  GetConsumersDto,
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
}
