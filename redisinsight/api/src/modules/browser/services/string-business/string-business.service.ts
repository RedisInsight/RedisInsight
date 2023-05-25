import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { RECOMMENDATION_NAMES, RedisErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { catchAclError } from 'src/utils';
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
import { plainToClass } from 'class-transformer';
import { GetKeyInfoDto } from 'src/modules/browser/dto';
import { ClientMetadata } from 'src/common/models';
import { DatabaseRecommendationService } from 'src/modules/database-recommendation/database-recommendation.service';

@Injectable()
export class StringBusinessService {
  private logger = new Logger('StringBusinessService');

  constructor(
    private browserTool: BrowserToolService,
    private recommendationService: DatabaseRecommendationService,
  ) {}

  public async setString(
    clientMetadata: ClientMetadata,
    dto: SetStringWithExpireDto,
  ): Promise<void> {
    this.logger.log('Setting string key type.');
    const { keyName, value, expire } = dto;
    let result;
    try {
      if (expire) {
        result = await this.browserTool.execCommand(
          clientMetadata,
          BrowserToolStringCommands.Set,
          [keyName, value, 'EX', `${expire}`, 'NX'],
        );
      } else {
        result = await this.browserTool.execCommand(
          clientMetadata,
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
    this.logger.log('Succeed to set string key type.');
  }

  public async getStringValue(
    clientMetadata: ClientMetadata,
    dto: GetKeyInfoDto,
  ): Promise<GetStringValueResponse> {
    this.logger.log('Getting string value.');

    const { keyName } = dto;
    let result: GetStringValueResponse;

    try {
      const value = await this.browserTool.execCommand(
        clientMetadata,
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
      this.recommendationService.check(
        clientMetadata,
        RECOMMENDATION_NAMES.STRING_TO_JSON,
        { value: result.value, keyName: result.keyName },
      );
      this.logger.log('Succeed to get string value.');
      return plainToClass(GetStringValueResponse, result);
    }
  }

  public async updateStringValue(
    clientMetadata: ClientMetadata,
    dto: SetStringDto,
  ): Promise<void> {
    this.logger.log('Updating string value.');
    const { keyName, value } = dto;
    let result;
    try {
      const ttl = await this.browserTool.execCommand(
        clientMetadata,
        BrowserToolKeysCommands.Ttl,
        [keyName],
      );
      result = await this.browserTool.execCommand(
        clientMetadata,
        BrowserToolStringCommands.Set,
        [keyName, value, 'XX'],
      );
      if (result && ttl > 0) {
        await this.browserTool.execCommand(
          clientMetadata,
          BrowserToolKeysCommands.Expire,
          [keyName, ttl],
        );
      }
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
