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
import { IFindRedisClientInstanceByOptions } from 'src/modules/core/services/redis/redis.service';
import {
  CreateRejsonRlWithExpireDto,
  GetRejsonRlDto,
  GetRejsonRlResponseDto,
  ModifyRejsonRlArrAppendDto,
  ModifyRejsonRlSetDto,
  RedisDataType,
  RemoveRejsonRlDto,
  RemoveRejsonRlResponse,
  SafeRejsonRlDataDtO,
} from 'src/modules/browser/dto';
import {
  BrowserToolKeysCommands,
  BrowserToolRejsonRlCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { BrowserToolService } from '../browser-tool/browser-tool.service';
import { BrowserAnalyticsService } from '../browser-analytics/browser-analytics.service';

@Injectable()
export class RejsonRlBusinessService {
  private logger = new Logger('JsonBusinessService');

  constructor(
    private browserTool: BrowserToolService,
    private browserAnalyticsService: BrowserAnalyticsService,
  ) {}

  private async forceGetJson(
    clientOptions: IFindRedisClientInstanceByOptions,
    keyName: string,
    path: string,
  ): Promise<any> {
    const data = await this.browserTool.execCommand(
      clientOptions,
      BrowserToolRejsonRlCommands.JsonGet,
      [keyName, path],
    );

    if (data === null) {
      throw new BadRequestException(
        `There is no such path: "${path}" in key: "${keyName}"`,
      );
    }

    return JSON.parse(data);
  }

  private async estimateSize(
    clientOptions: IFindRedisClientInstanceByOptions,
    keyName: string,
    path: string,
  ): Promise<number | null> {
    const size = await this.browserTool.execCommand(
      clientOptions,
      BrowserToolRejsonRlCommands.JsonDebug,
      ['MEMORY', keyName, path],
    );

    if (size === null) {
      throw new BadRequestException(
        `There is no such path: "${path}" in key: "${keyName}"`,
      );
    }

    return size;
  }

  private async getObjectKeys(
    clientOptions: IFindRedisClientInstanceByOptions,
    keyName: string,
    path: string,
  ): Promise<string[]> {
    return this.browserTool.execCommand(
      clientOptions,
      BrowserToolRejsonRlCommands.JsonObjKeys,
      [keyName, path],
    );
  }

  private async getJsonDataType(
    clientOptions: IFindRedisClientInstanceByOptions,
    keyName: string,
    path: string,
  ): Promise<string> {
    return this.browserTool.execCommand(
      clientOptions,
      BrowserToolRejsonRlCommands.JsonType,
      [keyName, path],
    );
  }

  private async getDetails(
    clientOptions: IFindRedisClientInstanceByOptions,
    keyName: string,
    path: string,
    key: string | number,
  ): Promise<any> {
    const details = {
      key,
      path,
      cardinality: 1,
    };

    const objectDataType = await this.getJsonDataType(
      clientOptions,
      keyName,
      path,
    );

    details['type'] = objectDataType;
    switch (objectDataType) {
      case 'object':
        details[
          'cardinality'
        ] = await this.browserTool.execCommand(
          clientOptions,
          BrowserToolRejsonRlCommands.JsonObjLen,
          [keyName, path],
        );
        break;
      case 'array':
        details[
          'cardinality'
        ] = await this.browserTool.execCommand(
          clientOptions,
          BrowserToolRejsonRlCommands.JsonArrLen,
          [keyName, path],
        );
        break;
      default:
        details['value'] = await this.forceGetJson(
          clientOptions,
          keyName,
          path,
        );
        break;
    }

    return details;
  }

  private async safeGetJsonByType(
    clientOptions: IFindRedisClientInstanceByOptions,
    keyName: string,
    path: string,
    type: string,
  ): Promise<SafeRejsonRlDataDtO[]> {
    const result = [];
    let objectKeys: string[];
    let arrayLength: number;

    switch (type) {
      case 'object':
        objectKeys = await this.getObjectKeys(
          clientOptions,
          keyName,
          path,
        );
        for (const objectKey of objectKeys) {
          const rootPath = path === '.' ? '' : path;
          const childPath = objectKey.includes('"')
            ? `['${objectKey}']`
            : `["${objectKey}"]`;
          const fullObjectKeyPath = `${rootPath}${childPath}`;
          result.push(
            await this.getDetails(
              clientOptions,
              keyName,
              fullObjectKeyPath,
              objectKey,
            ),
          );
        }

        break;
      case 'array':
        arrayLength = await this.browserTool.execCommand(
          clientOptions,
          BrowserToolRejsonRlCommands.JsonArrLen,
          [keyName, path],
        );

        for (let i = 0; i < arrayLength; i += 1) {
          const fullObjectKeyPath = `${path === '.' ? '' : path}[${i}]`;
          result.push(
            await this.getDetails(clientOptions, keyName, fullObjectKeyPath, i),
          );
        }
        break;
      default:
        return this.forceGetJson(clientOptions, keyName, path);
    }

    return result;
  }

  /**
   * Method to create REJSON-RL type
   * Supports key TTL
   *
   * @param clientOptions
   * @param dto
   */
  public async create(
    clientOptions: IFindRedisClientInstanceByOptions,
    dto: CreateRejsonRlWithExpireDto,
  ): Promise<void> {
    this.logger.log('Creating REJSON-RL data type.');

    const { keyName, data, expire } = dto;
    try {
      const result = await this.browserTool.execCommand(
        clientOptions,
        BrowserToolRejsonRlCommands.JsonSet,
        [keyName, '.', data, 'NX'],
      );

      if (!result) {
        throw new ConflictException(ERROR_MESSAGES.KEY_NAME_EXIST);
      }

      this.logger.log('Succeed to create REJSON-RL data type.');
      this.browserAnalyticsService.sendKeyAddedEvent(
        clientOptions.instanceId,
        RedisDataType.JSON,
        {
          TTL: -1,
        },
      );

      if (expire) {
        try {
          await this.browserTool.execCommand(
            clientOptions,
            BrowserToolKeysCommands.Expire,
            [keyName, expire],
          );
          this.browserAnalyticsService.sendKeyTTLChangedEvent(
            clientOptions.instanceId,
            expire,
            -1,
          );
        } catch (err) {
          this.logger.error(
            `Unable to set expire ${expire} for REJSON-RL key ${keyName}.`,
          );
        }
      }
    } catch (error) {
      this.logger.error('Failed to create REJSON-RL data type.', error);

      if (error instanceof ConflictException) {
        throw error;
      }

      if (error.message.includes(RedisErrorCodes.UnknownCommand)) {
        throw new BadRequestException(
          ERROR_MESSAGES.REDIS_MODULE_IS_REQUIRED('RedisJSON'),
        );
      }

      catchAclError(error);
    }
  }

  public async getJson(
    clientOptions: IFindRedisClientInstanceByOptions,
    dto: GetRejsonRlDto,
  ): Promise<GetRejsonRlResponseDto> {
    this.logger.log('Getting json by key.'); // todo: investigate logger implementation
    const { keyName, path, forceRetrieve } = dto;

    const result: GetRejsonRlResponseDto = {
      downloaded: true,
      path,
      data: null,
    };

    try {
      // Get value in the path without any checks
      if (forceRetrieve) {
        result.data = await this.forceGetJson(clientOptions, keyName, path);
        return result;
      }

      const jsonSize = await this.estimateSize(clientOptions, keyName, path);
      if (jsonSize > config.get('modules')['json']['sizeThreshold']) {
        const type = await this.getJsonDataType(clientOptions, keyName, path);
        result.downloaded = false;
        result.type = type;
        result.data = await this.safeGetJsonByType(
          clientOptions,
          keyName,
          path,
          type,
        );
      } else {
        result.data = await this.forceGetJson(clientOptions, keyName, path);
      }

      return result;
    } catch (error) {
      this.logger.error('Failed to get json.', error);

      if (error.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }

      if (error.message.includes(RedisErrorCodes.UnknownCommand)) {
        throw new BadRequestException(
          ERROR_MESSAGES.REDIS_MODULE_IS_REQUIRED('RedisJSON'),
        );
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
   * @param clientOptions
   * @param dto
   */
  public async jsonSet(
    clientOptions: IFindRedisClientInstanceByOptions,
    dto: ModifyRejsonRlSetDto,
  ): Promise<void> {
    this.logger.log('Modifying REJSON-RL data type.');
    const { keyName, path, data } = dto;

    try {
      const exists = await this.browserTool.execCommand(
        clientOptions,
        BrowserToolKeysCommands.Exists,
        [keyName],
      );

      if (!exists) {
        throw new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST);
      }
      const type = await this.getJsonDataType(clientOptions, keyName, path);
      await this.browserTool.execCommand(
        clientOptions,
        BrowserToolRejsonRlCommands.JsonSet,
        [keyName, path, data],
      );
      if (type) {
        this.browserAnalyticsService.sendJsonPropertyEditedEvent(
          clientOptions.instanceId,
          path,
        );
      } else {
        this.browserAnalyticsService.sendJsonPropertyAddedEvent(
          clientOptions.instanceId,
          path,
        );
      }

      this.logger.log('Succeed to modify REJSON-RL data type.');
    } catch (error) {
      this.logger.error('Failed to modify REJSON-RL data type.', error);

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
        throw new BadRequestException(
          ERROR_MESSAGES.REDIS_MODULE_IS_REQUIRED('RedisJSON'),
        );
      }

      throw catchAclError(error);
    }
  }

  /**
   * Method to modify REJSON-RL type using JSON.ARRAPPEND command
   * @param clientOptions
   * @param dto
   */
  public async arrAppend(
    clientOptions: IFindRedisClientInstanceByOptions,
    dto: ModifyRejsonRlArrAppendDto,
  ): Promise<void> {
    this.logger.log('Modifying REJSON-RL data type.');
    const { keyName, path, data } = dto;
    try {
      const exists = await this.browserTool.execCommand(
        clientOptions,
        BrowserToolKeysCommands.Exists,
        [keyName],
      );

      if (!exists) {
        throw new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST);
      }

      await this.browserTool.execCommand(
        clientOptions,
        BrowserToolRejsonRlCommands.JsonArrAppend,
        [keyName, path, ...data],
      );
      this.browserAnalyticsService.sendJsonArrayPropertyAppendEvent(
        clientOptions.instanceId,
        path,
      );
      this.logger.log('Succeed to modify REJSON-RL data type.');
    } catch (error) {
      this.logger.error('Failed to modify REJSON-RL data type', error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error.message.includes(RedisErrorCodes.UnknownCommand)) {
        throw new BadRequestException(
          ERROR_MESSAGES.REDIS_MODULE_IS_REQUIRED('RedisJSON'),
        );
      }

      throw catchAclError(error);
    }
  }

  /**
   * Method to remove REJSON-RL path using JSON.DEL command
   * @param clientOptions
   * @param dto
   */
  public async remove(
    clientOptions: IFindRedisClientInstanceByOptions,
    dto: RemoveRejsonRlDto,
  ): Promise<RemoveRejsonRlResponse> {
    this.logger.log('Removing REJSON-RL data.');
    const { keyName, path } = dto;
    try {
      const exists = await this.browserTool.execCommand(
        clientOptions,
        BrowserToolKeysCommands.Exists,
        [keyName],
      );

      if (!exists) {
        throw new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST);
      }

      const affected = await this.browserTool.execCommand(
        clientOptions,
        BrowserToolRejsonRlCommands.JsonDel,
        [keyName, path],
      );
      if (affected) {
        this.browserAnalyticsService.sendJsonPropertyDeletedEvent(
          clientOptions.instanceId,
          path,
        );
      }
      this.logger.log('Succeed to remove REJSON-RL path.');
      return { affected };
    } catch (error) {
      this.logger.error('Failed to remove REJSON-RL path.', error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error.message.includes(RedisErrorCodes.UnknownCommand)) {
        throw new BadRequestException(
          ERROR_MESSAGES.REDIS_MODULE_IS_REQUIRED('RedisJSON'),
        );
      }

      throw catchAclError(error);
    }
  }
}
