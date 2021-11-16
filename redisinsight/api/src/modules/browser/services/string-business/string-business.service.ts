import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { RedisErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { catchAclError } from 'src/utils';
import { RedisDataType } from 'src/modules/browser/dto';
import { IFindRedisClientInstanceByOptions } from 'src/modules/core/services/redis/redis.service';
import {
  GetStringValueResponse,
  SetStringDto,
  SetStringWithExpireDto,
} from 'src/modules/browser/dto/string.dto';
import { BrowserToolService } from 'src/modules/browser/services/browser-tool/browser-tool.service';
import {
  BrowserToolKeysCommands,
  BrowserToolStringCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { BrowserAnalyticsService } from '../browser-analytics/browser-analytics.service';

@Injectable()
export class StringBusinessService {
  private logger = new Logger('StringBusinessService');

  constructor(
    private browserTool: BrowserToolService,
    private browserAnalyticsService: BrowserAnalyticsService,
  ) {}

  public async setString(
    clientOptions: IFindRedisClientInstanceByOptions,
    dto: SetStringWithExpireDto,
  ): Promise<void> {
    this.logger.log('Setting string key type.');
    const { keyName, value, expire } = dto;
    let result;
    try {
      if (expire) {
        result = await this.browserTool.execCommand(
          clientOptions,
          BrowserToolStringCommands.Set,
          [keyName, value, 'EX', `${expire}`, 'NX'],
        );
      } else {
        result = await this.browserTool.execCommand(
          clientOptions,
          BrowserToolStringCommands.Set,
          [keyName, value, 'NX'],
        );
      }
    } catch (error) {
      this.logger.error('Failed to set string key type', error);
      catchAclError(error);
    }
    if (!result) {
      this.logger.error(
        `Failed to set string key type. ${ERROR_MESSAGES.KEY_NAME_EXIST} key: ${keyName}`,
      );
      throw new ConflictException(ERROR_MESSAGES.KEY_NAME_EXIST);
    }
    this.browserAnalyticsService.sendKeyAddedEvent(
      clientOptions.instanceId,
      RedisDataType.String,
      {
        length: dto.value.length,
        TTL: dto.expire || -1,
      },
    );
    this.logger.log('Succeed to set string key type.');
  }

  public async getStringValue(
    clientOptions: IFindRedisClientInstanceByOptions,
    keyName: string,
  ): Promise<GetStringValueResponse> {
    this.logger.log('Getting string value.');
    let result: GetStringValueResponse;
    try {
      const value = await this.browserTool.execCommand(
        clientOptions,
        BrowserToolStringCommands.Get,
        [keyName],
      );
      result = { value, keyName };
    } catch (error) {
      this.logger.error('Failed to get string value.', error);
      if (error.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      catchAclError(error);
    }
    if (result.value === null) {
      this.logger.error(
        `Failed to get string value. Not Found key: ${keyName}.`,
      );
      throw new NotFoundException();
    } else {
      this.logger.log('Succeed to get string value.');
      return result;
    }
  }

  public async updateStringValue(
    clientOptions: IFindRedisClientInstanceByOptions,
    dto: SetStringDto,
  ): Promise<void> {
    this.logger.log('Updating string value.');
    const { keyName, value } = dto;
    let result;
    try {
      const ttl = await this.browserTool.execCommand(
        clientOptions,
        BrowserToolKeysCommands.Ttl,
        [keyName],
      );
      result = await this.browserTool.execCommand(
        clientOptions,
        BrowserToolStringCommands.Set,
        [keyName, value, 'XX'],
      );
      if (result && ttl > 0) {
        await this.browserTool.execCommand(
          clientOptions,
          BrowserToolKeysCommands.Expire,
          [keyName, ttl],
        );
      }
      this.browserAnalyticsService.sendKeyValueEditedEvent(
        clientOptions.instanceId,
        RedisDataType.String,
      );
    } catch (error) {
      this.logger.error('Failed to update string value.', error);
      catchAclError(error);
    }
    if (!result) {
      this.logger.error(
        `Failed to update string value. ${ERROR_MESSAGES.KEY_NOT_EXIST} key: ${keyName}`,
      );
      throw new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST);
    }
    this.logger.log('Succeed to update string value.');
  }
}
