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
  SafeRejsonRlDataDtO,
} from 'src/modules/browser/rejson-rl/rejson-rl.dto';
import {
  BrowserToolKeysCommands,
  BrowserToolRejsonRlCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { RedisString } from 'src/common/constants';
import { BrowserToolService } from 'src/modules/browser/services/browser-tool/browser-tool.service';

@Injectable()
export class RejsonRlService {
  private logger = new Logger('JsonService');

  constructor(private browserTool: BrowserToolService) {}

  private async forceGetJson(
    clientMetadata: ClientMetadata,
    keyName: RedisString,
    path: string,
  ): Promise<any> {
    const data = await this.browserTool.execCommand(
      clientMetadata,
      BrowserToolRejsonRlCommands.JsonGet,
      [keyName, path],
      'utf8',
    );

    if (data === null) {
      throw new BadRequestException(
        `There is no such path: "${path}" in key: "${keyName}"`,
      );
    }

    return JSON.parse(data);
  }

  private async estimateSize(
    clientMetadata: ClientMetadata,
    keyName: RedisString,
    path: string,
  ): Promise<number | null> {
    let size = 0;

    try {
      size = await this.browserTool.execCommand(
        clientMetadata,
        BrowserToolRejsonRlCommands.JsonDebug,
        ['MEMORY', keyName, path],
      );
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
    clientMetadata: ClientMetadata,
    keyName: RedisString,
    path: string,
  ): Promise<string[]> {
    return this.browserTool.execCommand(
      clientMetadata,
      BrowserToolRejsonRlCommands.JsonObjKeys,
      [keyName, path],
      'utf8',
    );
  }

  private async getJsonDataType(
    clientMetadata: ClientMetadata,
    keyName: RedisString,
    path: string,
  ): Promise<string> {
    return this.browserTool.execCommand(
      clientMetadata,
      BrowserToolRejsonRlCommands.JsonType,
      [keyName, path],
      'utf8',
    );
  }

  private async getDetails(
    clientMetadata: ClientMetadata,
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
      clientMetadata,
      keyName,
      path,
    );

    details['type'] = objectKeyType;
    switch (objectKeyType) {
      case 'object':
        details[
          'cardinality'
        ] = await this.browserTool.execCommand(
          clientMetadata,
          BrowserToolRejsonRlCommands.JsonObjLen,
          [keyName, path],
          'utf8',
        );
        break;
      case 'array':
        details[
          'cardinality'
        ] = await this.browserTool.execCommand(
          clientMetadata,
          BrowserToolRejsonRlCommands.JsonArrLen,
          [keyName, path],
          'utf8',
        );
        break;
      default:
        details['value'] = await this.forceGetJson(
          clientMetadata,
          keyName,
          path,
        );
        break;
    }

    return details;
  }

  private async safeGetJsonByType(
    clientMetadata: ClientMetadata,
    keyName: RedisString,
    path: string,
    type: string,
  ): Promise<SafeRejsonRlDataDtO[]> {
    const result = [];
    let objectKeys: string[];
    let arrayLength: number;

    switch (type) {
      case 'object':
        objectKeys = await this.getObjectKeys(
          clientMetadata,
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
              clientMetadata,
              keyName,
              fullObjectKeyPath,
              objectKey,
            ),
          );
        }

        break;
      case 'array':
        arrayLength = await this.browserTool.execCommand(
          clientMetadata,
          BrowserToolRejsonRlCommands.JsonArrLen,
          [keyName, path],
          'utf8',
        );

        for (let i = 0; i < arrayLength; i += 1) {
          const fullObjectKeyPath = `${path === '.' ? '' : path}[${i}]`;
          result.push(
            await this.getDetails(clientMetadata, keyName, fullObjectKeyPath, i),
          );
        }
        break;
      default:
        return this.forceGetJson(clientMetadata, keyName, path);
    }

    return result;
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
    this.logger.log('Creating REJSON-RL data type.');

    const { keyName, data, expire } = dto;
    try {
      const result = await this.browserTool.execCommand(
        clientMetadata,
        BrowserToolRejsonRlCommands.JsonSet,
        [keyName, '.', data, 'NX'],
      );

      if (!result) {
        throw new ConflictException(ERROR_MESSAGES.KEY_NAME_EXIST);
      }

      this.logger.log('Succeed to create REJSON-RL key type.');

      if (expire) {
        try {
          await this.browserTool.execCommand(
            clientMetadata,
            BrowserToolKeysCommands.Expire,
            [keyName, expire],
          );
        } catch (err) {
          this.logger.error(
            `Unable to set expire ${expire} for REJSON-RL key ${keyName}.`,
          );
        }
      }
    } catch (error) {
      this.logger.error('Failed to create REJSON-RL key type.', error);

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
    clientMetadata: ClientMetadata,
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
        result.data = await this.forceGetJson(clientMetadata, keyName, path);
        return result;
      }

      const jsonSize = await this.estimateSize(clientMetadata, keyName, path);
      if (jsonSize > config.get('modules')['json']['sizeThreshold']) {
        const type = await this.getJsonDataType(clientMetadata, keyName, path);
        result.downloaded = false;
        result.type = type;
        result.data = await this.safeGetJsonByType(
          clientMetadata,
          keyName,
          path,
          type,
        );
      } else {
        result.data = await this.forceGetJson(clientMetadata, keyName, path);
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
   * @param clientMetadata
   * @param dto
   */
  public async jsonSet(
    clientMetadata: ClientMetadata,
    dto: ModifyRejsonRlSetDto,
  ): Promise<void> {
    this.logger.log('Modifying REJSON-RL data type.');
    const { keyName, path, data } = dto;

    try {
      const exists = await this.browserTool.execCommand(
        clientMetadata,
        BrowserToolKeysCommands.Exists,
        [keyName],
      );

      if (!exists) {
        throw new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST);
      }
      await this.getJsonDataType(clientMetadata, keyName, path);
      await this.browserTool.execCommand(
        clientMetadata,
        BrowserToolRejsonRlCommands.JsonSet,
        [keyName, path, data],
      );

      this.logger.log('Succeed to modify REJSON-RL key type.');
    } catch (error) {
      this.logger.error('Failed to modify REJSON-RL key type.', error);

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
   * @param clientMetadata
   * @param dto
   */
  public async arrAppend(
    clientMetadata: ClientMetadata,
    dto: ModifyRejsonRlArrAppendDto,
  ): Promise<void> {
    this.logger.log('Modifying REJSON-RL data type.');
    const { keyName, path, data } = dto;
    try {
      const exists = await this.browserTool.execCommand(
        clientMetadata,
        BrowserToolKeysCommands.Exists,
        [keyName],
      );

      if (!exists) {
        throw new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST);
      }

      await this.browserTool.execCommand(
        clientMetadata,
        BrowserToolRejsonRlCommands.JsonArrAppend,
        [keyName, path, ...data],
      );
      this.logger.log('Succeed to modify REJSON-RL key type.');
    } catch (error) {
      this.logger.error('Failed to modify REJSON-RL key type', error);

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
   * @param clientMetadata
   * @param dto
   */
  public async remove(
    clientMetadata: ClientMetadata,
    dto: RemoveRejsonRlDto,
  ): Promise<RemoveRejsonRlResponse> {
    this.logger.log('Removing REJSON-RL data.');
    const { keyName, path } = dto;
    try {
      const exists = await this.browserTool.execCommand(
        clientMetadata,
        BrowserToolKeysCommands.Exists,
        [keyName],
      );

      if (!exists) {
        throw new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST);
      }

      const affected = await this.browserTool.execCommand(
        clientMetadata,
        BrowserToolRejsonRlCommands.JsonDel,
        [keyName, path],
      );
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
