import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { chunk, flatMap, isNull } from 'lodash';
import {
  catchAclError, catchMultiTransactionError, isRedisGlob, unescapeRedisGlob,
} from 'src/utils';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { RECOMMENDATION_NAMES, RedisErrorCodes } from 'src/constants';
import config from 'src/utils/config';
import { ClientMetadata } from 'src/common/models';
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
} from 'src/modules/browser/hash/dto';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import { RedisClient } from 'src/modules/redis/client';
import { checkIfKeyExists, checkIfKeyNotExists } from 'src/modules/browser/utils';

const REDIS_SCAN_CONFIG = config.get('redis_scan');

@Injectable()
export class HashService {
  private logger = new Logger('HashService');

  constructor(
    private databaseClientFactory: DatabaseClientFactory,
    private recommendationService: DatabaseRecommendationService,
  ) {}

  public async createHash(
    clientMetadata: ClientMetadata,
    dto: CreateHashWithExpireDto,
  ): Promise<void> {
    try {
      this.logger.log('Creating Hash data type.');
      const { keyName, fields, expire } = dto;
      const client: RedisClient = await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyExists(keyName, client);

      const args = flatMap(fields, ({ field, value }: HashFieldDto) => [field, value]);
      if (expire) {
        await this.createHashWithExpiration(
          client,
          keyName,
          args,
          expire,
        );
      } else {
        await this.createSimpleHash(client, keyName, args);
      }

      this.logger.log('Succeed to create Hash data type.');
      return null;
    } catch (error) {
      this.logger.error('Failed to create Hash data type.', error);
      throw catchAclError(error);
    }
  }

  public async getFields(
    clientMetadata: ClientMetadata,
    dto: GetHashFieldsDto,
  ): Promise<GetHashFieldsResponse> {
    try {
      this.logger.log('Getting fields of the Hash data type stored at key.');
      const { keyName, cursor, match } = dto;
      const client: RedisClient = await this.databaseClientFactory.getOrCreateClient(clientMetadata);
      let result: GetHashFieldsResponse = {
        keyName,
        total: 0,
        fields: [],
        nextCursor: cursor,
      };

      result.total = await client.sendCommand([BrowserToolHashCommands.HLen, keyName]) as number;
      if (!result.total) {
        this.logger.error(`Failed to get fields of the Hash data type. Not Found key: ${keyName}.`);
        return Promise.reject(new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST));
      }
      if (match && !isRedisGlob(match)) {
        const field = unescapeRedisGlob(match);
        result.nextCursor = 0;
        const value = await client.sendCommand([BrowserToolHashCommands.HGet, keyName, field]);
        if (!isNull(value)) {
          result.fields.push(plainToClass(HashFieldDto, { field, value }));
        }
      } else {
        const scanResult = await this.scanHash(client, dto);
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
    try {
      this.logger.log('Adding fields to the Hash data type.');
      const { keyName, fields } = dto;
      const client: RedisClient = await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyNotExists(keyName, client);

      const args = flatMap(fields, ({ field, value }: HashFieldDto) => [field, value]);
      await client.sendCommand([BrowserToolHashCommands.HSet, keyName, ...args]);

      this.logger.log('Succeed to add fields to Hash data type.');
      return null;
    } catch (error) {
      this.logger.error('Failed to add fields to Hash data type.', error);
      if (error?.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      throw catchAclError(error);
    }
  }

  public async deleteFields(
    clientMetadata: ClientMetadata,
    dto: DeleteFieldsFromHashDto,
  ): Promise<DeleteFieldsFromHashResponse> {
    try {
      this.logger.log('Deleting fields from the Hash data type.');
      const { keyName, fields } = dto;
      const client: RedisClient = await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyNotExists(keyName, client);

      const result = await client.sendCommand([BrowserToolHashCommands.HDel, keyName, ...fields]) as number;

      this.logger.log('Succeed to delete fields from the Hash data type.');
      return { affected: result };
    } catch (error) {
      this.logger.error('Failed to delete fields from the Hash data type.', error);
      if (error?.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      throw catchAclError(error);
    }
  }

  public async createSimpleHash(
    client: RedisClient,
    key: RedisString,
    args: RedisString[],
  ): Promise<void> {
    await client.sendCommand([BrowserToolHashCommands.HSet, key, ...args]);
  }

  public async createHashWithExpiration(
    client: RedisClient,
    key: RedisString,
    args: RedisString[],
    expire,
  ): Promise<void> {
    const transactionResults = await client.sendPipeline([
      [BrowserToolHashCommands.HSet, key, ...args],
      [BrowserToolKeysCommands.Expire, key, expire],
    ]);
    catchMultiTransactionError(transactionResults);
  }

  public async scanHash(
    client: RedisClient,
    dto: GetHashFieldsDto,
  ): Promise<HashScanResponse> {
    const { keyName, cursor } = dto;
    const count = dto.count || REDIS_SCAN_CONFIG.countDefault;
    const match = dto.match !== undefined ? dto.match : '*';
    let result: HashScanResponse = {
      keyName,
      nextCursor: null,
      fields: [],
    };
    while (result.nextCursor !== 0 && result.fields.length < count) {
      const scanResult = await client.sendCommand([
        BrowserToolHashCommands.HScan,
        keyName,
        `${result.nextCursor || cursor}`,
        'MATCH',
        match,
        'COUNT',
        count,
      ]);
      const nextCursor = scanResult[0];
      const fieldsArray = scanResult[1];
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
