import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { chunk, flatMap, isNull } from 'lodash';
import * as isGlob from 'is-glob';
import { catchAclError, catchTransactionError, unescapeGlob } from 'src/utils';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { RedisErrorCodes } from 'src/constants';
import config from 'src/utils/config';
import { IFindRedisClientInstanceByOptions } from 'src/modules/core/services/redis/redis.service';
import { RedisDataType } from 'src/modules/browser/dto';
import { BrowserToolService } from 'src/modules/browser/services/browser-tool/browser-tool.service';
import {
  BrowserToolHashCommands,
  BrowserToolKeysCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
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
  ) {}

  public async createHash(
    clientOptions: IFindRedisClientInstanceByOptions,
    dto: CreateHashWithExpireDto,
  ): Promise<void> {
    this.logger.log('Creating Hash data type.');
    const { keyName, fields } = dto;
    try {
      const isExist = await this.browserTool.execCommand(
        clientOptions,
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
          clientOptions,
          keyName,
          args,
          dto.expire,
        );
      } else {
        await this.createSimpleHash(clientOptions, keyName, args);
      }
      this.logger.log('Succeed to create Hash data type.');
    } catch (error) {
      this.logger.error('Failed to create Hash data type.', error);
      catchAclError(error);
    }
    return null;
  }

  public async getFields(
    clientOptions: IFindRedisClientInstanceByOptions,
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
        clientOptions,
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
      if (dto.match && !isGlob(dto.match, { strict: false })) {
        const field = unescapeGlob(dto.match);
        result.nextCursor = 0;
        const value = await this.browserTool.execCommand(
          clientOptions,
          BrowserToolHashCommands.HGet,
          [keyName, field],
        );
        if (!isNull(value)) {
          result.fields.push({ field, value });
        }
      } else {
        const scanResult = await this.scanHash(clientOptions, dto);
        result = { ...result, ...scanResult };
      }
      this.logger.log('Succeed to get fields of the Hash data type.');
      return result;
    } catch (error) {
      this.logger.error('Failed to get fields of the Hash data type.', error);
      if (error?.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      throw catchAclError(error);
    }
  }

  public async addFields(
    clientOptions: IFindRedisClientInstanceByOptions,
    dto: AddFieldsToHashDto,
  ): Promise<void> {
    this.logger.log('Adding fields to the Hash data type.');
    const { keyName, fields } = dto;
    try {
      const isExist = await this.browserTool.execCommand(
        clientOptions,
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
      const added = await this.browserTool.execCommand(
        clientOptions,
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
    clientOptions: IFindRedisClientInstanceByOptions,
    dto: DeleteFieldsFromHashDto,
  ): Promise<DeleteFieldsFromHashResponse> {
    this.logger.log('Deleting fields from the Hash data type.');
    const { keyName, fields } = dto;
    let result;
    try {
      const isExist = await this.browserTool.execCommand(
        clientOptions,
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
        clientOptions,
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
    clientOptions: IFindRedisClientInstanceByOptions,
    key: string,
    args: string[],
  ): Promise<void> {
    await this.browserTool.execCommand(
      clientOptions,
      BrowserToolHashCommands.HSet,
      [key, ...args],
    );
  }

  public async createHashWithExpiration(
    clientOptions: IFindRedisClientInstanceByOptions,
    key: string,
    args: string[],
    expire,
  ): Promise<void> {
    const [
      transactionError,
      transactionResults,
    ] = await this.browserTool.execMulti(clientOptions, [
      [BrowserToolHashCommands.HSet, key, ...args],
      [BrowserToolKeysCommands.Expire, key, expire],
    ]);
    catchTransactionError(transactionError, transactionResults);
  }

  public async scanHash(
    clientOptions: IFindRedisClientInstanceByOptions,
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
        clientOptions,
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
      ).map(([field, value]: string[]) => ({ field, value }));
      result = {
        ...result,
        nextCursor: parseInt(nextCursor, 10),
        fields: [...result.fields, ...fields],
      };
    }
    return result;
  }
}
