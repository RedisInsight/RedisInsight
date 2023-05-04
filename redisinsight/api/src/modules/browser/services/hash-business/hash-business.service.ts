import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { chunk, flatMap, isNull } from 'lodash';
import {
  catchAclError, catchTransactionError, isRedisGlob, unescapeRedisGlob,
} from 'src/utils';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { RECOMMENDATION_NAMES, RedisErrorCodes } from 'src/constants';
import config from 'src/utils/config';
import { ClientMetadata } from 'src/common/models';
import { BrowserToolService } from 'src/modules/browser/services/browser-tool/browser-tool.service';
import {
  BrowserToolHashCommands,
  BrowserToolKeysCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { RedisString } from 'src/common/constants';
import { plainToClass } from 'class-transformer';
import { DatabaseRecommendationService } from 'src/modules/database-recommendation/database-recommendation.service';
import {
  AddFieldsToHashDto,
  CreateHashWithExpireDto,
  DeleteFieldsFromHashDto,
  DeleteFieldsFromHashResponse,
  GetHashFieldsDto,
  GetHashFieldsResponse,
  HashFieldDto,
  HashScanResponse,
} from '../../dto/hash.dto';

const REDIS_SCAN_CONFIG = config.get('redis_scan');

@Injectable()
export class HashBusinessService {
  private logger = new Logger('hashBusinessService');

  constructor(
    private browserTool: BrowserToolService,
    private recommendationService: DatabaseRecommendationService,
  ) {}

  public async createHash(
    clientMetadata: ClientMetadata,
    dto: CreateHashWithExpireDto,
  ): Promise<void> {
    this.logger.log('Creating Hash data type.');
    const { keyName, fields } = dto;
    try {
      const isExist = await this.browserTool.execCommand(
        clientMetadata,
        BrowserToolKeysCommands.Exists,
        [keyName],
      );
      if (isExist) {
        this.logger.error(
          `Failed to create Hash data type. ${ERROR_MESSAGES.KEY_NAME_EXIST} key: ${keyName}`,
        );
        return Promise.reject(
          new ConflictException(ERROR_MESSAGES.KEY_NAME_EXIST),
        );
      }
      const args = flatMap(fields, ({ field, value }: HashFieldDto) => [field, value]);
      if (dto.expire) {
        await this.createHashWithExpiration(
          clientMetadata,
          keyName,
          args,
          dto.expire,
        );
      } else {
        await this.createSimpleHash(clientMetadata, keyName, args);
      }
      this.logger.log('Succeed to create Hash data type.');
    } catch (error) {
      this.logger.error('Failed to create Hash data type.', error);
      catchAclError(error);
    }
    return null;
  }

  public async getFields(
    clientMetadata: ClientMetadata,
    dto: GetHashFieldsDto,
  ): Promise<GetHashFieldsResponse> {
    this.logger.log('Getting fields of the Hash data type stored at key.');
    const { keyName } = dto;
    let result: GetHashFieldsResponse = {
      keyName,
      total: 0,
      fields: [],
      nextCursor: dto.cursor,
    };
    try {
      result.total = await this.browserTool.execCommand(
        clientMetadata,
        BrowserToolHashCommands.HLen,
        [keyName],
      );
      if (!result.total) {
        this.logger.error(
          `Failed to get fields of the Hash data type. Not Found key: ${keyName}.`,
        );
        return Promise.reject(
          new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST),
        );
      }
      if (dto.match && !isRedisGlob(dto.match)) {
        const field = unescapeRedisGlob(dto.match);
        result.nextCursor = 0;
        const value = await this.browserTool.execCommand(
          clientMetadata,
          BrowserToolHashCommands.HGet,
          [keyName, field],
        );
        if (!isNull(value)) {
          result.fields.push(plainToClass(HashFieldDto, { field, value }));
        }
      } else {
        const scanResult = await this.scanHash(clientMetadata, dto);
        result = { ...result, ...scanResult };
      }

      this.recommendationService.check(
        clientMetadata,
        RECOMMENDATION_NAMES.BIG_HASHES,
        { total: result.total, keyName },
      );
      this.logger.log('Succeed to get fields of the Hash data type.');
      return plainToClass(GetHashFieldsResponse, result);
    } catch (error) {
      this.logger.error('Failed to get fields of the Hash data type.', error);
      if (error?.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      throw catchAclError(error);
    }
  }

  public async addFields(
    clientMetadata: ClientMetadata,
    dto: AddFieldsToHashDto,
  ): Promise<void> {
    this.logger.log('Adding fields to the Hash data type.');
    const { keyName, fields } = dto;
    try {
      const isExist = await this.browserTool.execCommand(
        clientMetadata,
        BrowserToolKeysCommands.Exists,
        [keyName],
      );
      if (!isExist) {
        this.logger.error(
          `Failed to add fields to Hash data type. ${ERROR_MESSAGES.KEY_NOT_EXIST} key: ${keyName}`,
        );
        return Promise.reject(
          new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST),
        );
      }
      const args = flatMap(fields, ({ field, value }: HashFieldDto) => [field, value]);
      await this.browserTool.execCommand(
        clientMetadata,
        BrowserToolHashCommands.HSet,
        [keyName, ...args],
      );
      this.logger.log('Succeed to add fields to Hash data type.');
    } catch (error) {
      this.logger.error('Failed to add fields to Hash data type.', error);
      if (error?.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      catchAclError(error);
    }
    return null;
  }

  public async deleteFields(
    clientMetadata: ClientMetadata,
    dto: DeleteFieldsFromHashDto,
  ): Promise<DeleteFieldsFromHashResponse> {
    this.logger.log('Deleting fields from the Hash data type.');
    const { keyName, fields } = dto;
    let result;
    try {
      const isExist = await this.browserTool.execCommand(
        clientMetadata,
        BrowserToolKeysCommands.Exists,
        [keyName],
      );
      if (!isExist) {
        this.logger.error(
          `Failed to delete fields from the Hash data type. ${ERROR_MESSAGES.KEY_NOT_EXIST} key: ${keyName}`,
        );
        return Promise.reject(
          new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST),
        );
      }
      result = await this.browserTool.execCommand(
        clientMetadata,
        BrowserToolHashCommands.HDel,
        [keyName, ...fields],
      );
    } catch (error) {
      this.logger.error('Failed to delete fields from the Hash data type.', error);
      if (error?.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      catchAclError(error);
    }
    this.logger.log('Succeed to delete fields from the Hash data type.');
    return { affected: result };
  }

  public async createSimpleHash(
    clientMetadata: ClientMetadata,
    key: RedisString,
    args: RedisString[],
  ): Promise<void> {
    await this.browserTool.execCommand(
      clientMetadata,
      BrowserToolHashCommands.HSet,
      [key, ...args],
    );
  }

  public async createHashWithExpiration(
    clientMetadata: ClientMetadata,
    key: RedisString,
    args: RedisString[],
    expire,
  ): Promise<void> {
    const [
      transactionError,
      transactionResults,
    ] = await this.browserTool.execMulti(clientMetadata, [
      [BrowserToolHashCommands.HSet, key, ...args],
      [BrowserToolKeysCommands.Expire, key, expire],
    ]);
    catchTransactionError(transactionError, transactionResults);
  }

  public async scanHash(
    clientMetadata: ClientMetadata,
    dto: GetHashFieldsDto,
  ): Promise<HashScanResponse> {
    const { keyName } = dto;
    const count = dto.count || REDIS_SCAN_CONFIG.countDefault;
    const match = dto.match !== undefined ? dto.match : '*';
    let result: HashScanResponse = {
      keyName,
      nextCursor: null,
      fields: [],
    };
    while (result.nextCursor !== 0 && result.fields.length < count) {
      const scanResult = await this.browserTool.execCommand(
        clientMetadata,
        BrowserToolHashCommands.HScan,
        [
          keyName,
          `${result.nextCursor || dto.cursor}`,
          'MATCH',
          match,
          'COUNT',
          count,
        ],
      );
      const [nextCursor, fieldsArray] = scanResult;
      const fields: HashFieldDto[] = chunk(
        fieldsArray,
        2,
      ).map(([field, value]: string[]) => plainToClass(HashFieldDto, { field, value }));
      result = {
        ...result,
        nextCursor: parseInt(nextCursor, 10),
        fields: [...result.fields, ...fields],
      };
    }
    return result;
  }
}
