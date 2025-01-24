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
import config from 'src/utils/config';
import { ClientMetadata } from 'src/common/models';
import {
  CreateRejsonRlWithExpireDto,
  GetRejsonRlDto,
  GetRejsonRlResponseDto,
  ModifyRejsonRlArrAppendDto,
  ModifyRejsonRlSetDto,
  RemoveRejsonRlDto,
  RemoveRejsonRlResponse,
  SafeRejsonRlDataDto,
} from 'src/modules/browser/rejson-rl/dto';
import {
  BrowserToolKeysCommands,
  BrowserToolRejsonRlCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { RedisString } from 'src/common/constants';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import { checkIfKeyExists, checkIfKeyNotExists } from 'src/modules/browser/utils';
import { RedisClient } from 'src/modules/redis/client';

@Injectable()
export class RejsonRlService {
  private logger = new Logger('JsonService');

  constructor(private databaseClientFactory: DatabaseClientFactory) {}

  private async forceGetJson(
    client: RedisClient,
    keyName: RedisString,
    path: string,
  ): Promise<any> {
    const data = await client.sendCommand([
      BrowserToolRejsonRlCommands.JsonGet,
      keyName, path,
    ], { replyEncoding: 'utf8' }) as string;

    if (data === null) {
      throw new BadRequestException(
        `There is no such path: "${path}" in key: "${keyName}"`,
      );
    }

    return data
  }

  private async estimateSize(
    client: RedisClient,
    keyName: RedisString,
    path: string,
  ): Promise<number | null> {
    let size = 0;

    try {
      size = await client.sendCommand([
        BrowserToolRejsonRlCommands.JsonDebug,
        'MEMORY',
        keyName,
        path,
      ]) as number;
    } catch (error) {
      this.logger.error('Failed to estimate size of json.', error);
    }

    if (size === null) {
      throw new BadRequestException(
        `There is no such path: "${path}" in key: "${keyName}"`,
      );
    }

    return size;
  }

  private async getObjectKeys(
    client: RedisClient,
    keyName: RedisString,
    path: string,
  ): Promise<string[]> {
    return await client.sendCommand([
      BrowserToolRejsonRlCommands.JsonObjKeys,
      keyName,
      path,
    ], { replyEncoding: 'utf8' }) as string[];
  }

  private async getJsonDataType(
    client: RedisClient,
    keyName: RedisString,
    path: string,
  ): Promise<string> {
    return await client.sendCommand([
      BrowserToolRejsonRlCommands.JsonType,
      keyName,
      path,
    ], { replyEncoding: 'utf8' }) as string;
  }

  private async getDetails(
    client: RedisClient,
    keyName: RedisString,
    path: string,
    key: string | number,
  ): Promise<any> {
    const details = {
      key,
      path,
      cardinality: 1,
    };

    const objectKeyType = await this.getJsonDataType(
      client,
      keyName,
      path,
    );

    details['type'] = objectKeyType;
    switch (objectKeyType) {
      case 'object':
        details[
          'cardinality'
        ] = await client.sendCommand([
          BrowserToolRejsonRlCommands.JsonObjLen,
          keyName,
          path,
        ], { replyEncoding: 'utf8' }) as number;
        break;
      case 'array':
        details[
          'cardinality'
        ] = await client.sendCommand([
          BrowserToolRejsonRlCommands.JsonArrLen,
          keyName,
          path,
        ], { replyEncoding: 'utf8' }) as number;
        break;
      default:
        details['value'] = await this.forceGetJson(
          client,
          keyName,
          path,
        );
        break;
    }

    return details;
  }

  private async safeGetJsonByType(
    client: RedisClient,
    keyName: RedisString,
    path: string,
    type: string,
  ): Promise<SafeRejsonRlDataDto[]> {
    const promises = [];
    let objectKeys: string[];
    let arrayLength: number;

    switch (type) {
      case 'object':
        objectKeys = await this.getObjectKeys(client, keyName, path);
        for (const objectKey of objectKeys) {
          const rootPath = path === '.' ? '' : path;
          const childPath = objectKey.includes('"')
            ? `['${objectKey}']`
            : `["${objectKey}"]`;
          const fullObjectKeyPath = `${rootPath}${childPath}`;
          promises.push(
            this.getDetails(
              client,
              keyName,
              fullObjectKeyPath,
              objectKey,
            ),
          );
        }

        return Promise.all(promises);
      case 'array':
        arrayLength = await client.sendCommand([
          BrowserToolRejsonRlCommands.JsonArrLen,
          keyName,
          path,
        ], { replyEncoding: 'utf8' }) as number;
        for (let i = 0; i < arrayLength; i += 1) {
          const fullObjectKeyPath = `${path === '.' ? '' : path}[${i}]`;
          promises.push(this.getDetails(client, keyName, fullObjectKeyPath, i));
        }

        return Promise.all(promises);
      default:
        return this.forceGetJson(client, keyName, path);
    }
  }

  /**
   * Method to create REJSON-RL type
   * Supports key TTL
   *
   * @param clientMetadata
   * @param dto
   */
  public async create(
    clientMetadata: ClientMetadata,
    dto: CreateRejsonRlWithExpireDto,
  ): Promise<void> {
    try {
      this.logger.debug('Creating REJSON-RL data type.', clientMetadata);
      const { keyName, data, expire } = dto;
      const client: RedisClient = await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyExists(keyName, client);

      await client.sendCommand([
        BrowserToolRejsonRlCommands.JsonSet,
        keyName,
        '.',
        data,
        'NX',
      ]);

      if (expire) {
        try {
          await client.sendCommand([
            BrowserToolKeysCommands.Expire,
            keyName,
            expire,
          ]);
        } catch (err) {
          this.logger.error(`Unable to set expire ${expire} for REJSON-RL key ${keyName}.`, err, clientMetadata);
        }
      }

      this.logger.debug('Succeed to create REJSON-RL key type.', clientMetadata);
    } catch (error) {
      this.logger.error('Failed to create REJSON-RL key type.', error, clientMetadata);

      if (error instanceof ConflictException) {
        throw error;
      }

      if (error.message.includes(RedisErrorCodes.UnknownCommand)) {
        throw new BadRequestException({
          message: ERROR_MESSAGES.REDIS_MODULE_IS_REQUIRED('JSON'),
        });
      }

      throw catchAclError(error);
    }
  }

  public async getJson(
    clientMetadata: ClientMetadata,
    dto: GetRejsonRlDto,
  ): Promise<GetRejsonRlResponseDto> {
    try {
      this.logger.debug('Getting json by key.', clientMetadata);
      const { keyName, path, forceRetrieve } = dto;
      const client: RedisClient = await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      const result: GetRejsonRlResponseDto = {
        downloaded: true,
        path,
        data: null,
      };

      // Get value in the path without any checks
      if (forceRetrieve) {
        result.data = await this.forceGetJson(client, keyName, path);
        return result;
      }

      const jsonSize = await this.estimateSize(client, keyName, path);
      if (jsonSize > config.get('modules')['json']['sizeThreshold']) {
        const type = await this.getJsonDataType(client, keyName, path);
        result.downloaded = false;
        result.type = type;
        result.data = await this.safeGetJsonByType(
          client,
          keyName,
          path,
          type,
        );
      } else {
        result.data = await this.forceGetJson(client, keyName, path);
      }

      return result;
    } catch (error) {
      this.logger.error('Failed to get json.', error, clientMetadata);

      if (error.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }

      if (error.message.includes(RedisErrorCodes.UnknownCommand)) {
        throw new BadRequestException({
          message: ERROR_MESSAGES.REDIS_MODULE_IS_REQUIRED('JSON')
        });
      }

      // todo: refactor error handling across the project
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw catchAclError(error);
    }
  }

  /**
   * Method to modify REJSON-RL type using JSON.SET command
   * @param clientMetadata
   * @param dto
   */
  public async jsonSet(
    clientMetadata: ClientMetadata,
    dto: ModifyRejsonRlSetDto,
  ): Promise<void> {
    try {
      this.logger.debug('Modifying REJSON-RL data type.', clientMetadata);
      const { keyName, path, data } = dto;
      const client = await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyNotExists(keyName, client);

      await this.getJsonDataType(client, keyName, path);
      await client.sendCommand([
        BrowserToolRejsonRlCommands.JsonSet,
        keyName,
        path,
        data,
      ]);

      this.logger.debug('Succeed to modify REJSON-RL key type.', clientMetadata);
    } catch (error) {
      this.logger.error('Failed to modify REJSON-RL key type.', error, clientMetadata);

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (
        error.message.includes('index')
        && error.message.includes('out of range')
      ) {
        throw new NotFoundException(ERROR_MESSAGES.PATH_NOT_EXISTS());
      }

      if (error.message.includes(RedisErrorCodes.UnknownCommand)) {
        throw new BadRequestException({
          message: ERROR_MESSAGES.REDIS_MODULE_IS_REQUIRED('JSON'),
        });
      }

      throw catchAclError(error);
    }
  }

  /**
   * Method to modify REJSON-RL type using JSON.ARRAPPEND command
   * @param clientMetadata
   * @param dto
   */
  public async arrAppend(
    clientMetadata: ClientMetadata,
    dto: ModifyRejsonRlArrAppendDto,
  ): Promise<void> {
    try {
      this.logger.debug('Modifying REJSON-RL data type.', clientMetadata);
      const { keyName, path, data } = dto;
      const client = await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyNotExists(keyName, client);

      await client.sendCommand([
        BrowserToolRejsonRlCommands.JsonArrAppend,
        keyName,
        path,
        ...data,
      ]);

      this.logger.log('Succeed to modify REJSON-RL key type.', clientMetadata);
    } catch (error) {
      this.logger.error('Failed to modify REJSON-RL key type', error, clientMetadata);

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error.message.includes(RedisErrorCodes.UnknownCommand)) {
        throw new BadRequestException({
          message: ERROR_MESSAGES.REDIS_MODULE_IS_REQUIRED('JSON'),
        });
      }

      throw catchAclError(error);
    }
  }

  /**
   * Method to remove REJSON-RL path using JSON.DEL command
   * @param clientMetadata
   * @param dto
   */
  public async remove(
    clientMetadata: ClientMetadata,
    dto: RemoveRejsonRlDto,
  ): Promise<RemoveRejsonRlResponse> {
    try {
      this.logger.debug('Removing REJSON-RL data.', clientMetadata);
      const { keyName, path } = dto;
      const client = await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyNotExists(keyName, client);

      const affected = await client.sendCommand([
        BrowserToolRejsonRlCommands.JsonDel,
        keyName,
        path,
      ]) as number;

      this.logger.debug('Succeed to remove REJSON-RL path.', clientMetadata);
      return { affected };
    } catch (error) {
      this.logger.error('Failed to remove REJSON-RL path.', error, clientMetadata);

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error.message.includes(RedisErrorCodes.UnknownCommand)) {
        throw new BadRequestException({
          message: ERROR_MESSAGES.REDIS_MODULE_IS_REQUIRED('JSON'),
        });
      }

      throw catchAclError(error);
    }
  }
}
