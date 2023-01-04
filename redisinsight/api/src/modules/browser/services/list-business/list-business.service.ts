import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { isNull, isArray } from 'lodash';
import { RedisErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { catchAclError, catchTransactionError } from 'src/utils';
import { ClientMetadata } from 'src/common/models';
import {
  CreateListWithExpireDto,
  DeleteListElementsDto,
  DeleteListElementsResponse,
  GetListElementResponse,
  GetListElementsDto,
  GetListElementsResponse,
  KeyDto,
  ListElementDestination,
  PushElementToListDto,
  PushListElementsResponse,
  SetListElementDto,
  SetListElementResponse,
} from 'src/modules/browser/dto';
import {
  BrowserToolKeysCommands,
  BrowserToolListCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { plainToClass } from 'class-transformer';
import { BrowserToolService } from '../browser-tool/browser-tool.service';

@Injectable()
export class ListBusinessService {
  private logger = new Logger('ListBusinessService');

  constructor(
    private browserTool: BrowserToolService,
  ) {}

  public async createList(
    clientMetadata: ClientMetadata,
    dto: CreateListWithExpireDto,
  ): Promise<void> {
    this.logger.log('Creating list data type.');
    const { keyName } = dto;
    try {
      const isExist = await this.browserTool.execCommand(
        clientMetadata,
        BrowserToolKeysCommands.Exists,
        [keyName],
      );
      if (isExist) {
        this.logger.error(
          `Failed to create list data type. ${ERROR_MESSAGES.KEY_NAME_EXIST} key: ${keyName}`,
        );
        return Promise.reject(
          new ConflictException(ERROR_MESSAGES.KEY_NAME_EXIST),
        );
      }
      if (dto.expire) {
        await this.createListWithExpiration(clientMetadata, dto);
      } else {
        await this.createSimpleList(clientMetadata, dto);
      }
      this.logger.log('Succeed to create list data type.');
    } catch (error) {
      this.logger.error('Failed to create list data type.', error);
      catchAclError(error);
    }
    return null;
  }

  public async pushElement(
    clientMetadata: ClientMetadata,
    dto: PushElementToListDto,
  ): Promise<PushListElementsResponse> {
    this.logger.log('Insert element at the tail/head of the list data type.');
    const { keyName, element, destination } = dto;
    try {
      const total = await this.browserTool.execCommand(
        clientMetadata,
        destination === ListElementDestination.Tail
          ? BrowserToolListCommands.RPushX
          : BrowserToolListCommands.LPushX,
        [keyName, element],
      );
      if (!total) {
        this.logger.error(
          `Failed to inserts element at the ${destination} of the list data type. Key not found. key: ${keyName}`,
        );
        return Promise.reject(
          new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST),
        );
      }
      this.logger.log(
        `Succeed to insert element at the ${destination} of the list data type.`,
      );
      return plainToClass(PushListElementsResponse, { keyName, total });
    } catch (error) {
      this.logger.error('Failed to inserts element to the list data type.', error);
      if (error.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      throw catchAclError(error);
    }
  }

  public async getElements(
    clientMetadata: ClientMetadata,
    dto: GetListElementsDto,
  ): Promise<GetListElementsResponse> {
    this.logger.log('Getting elements of the list stored at key.');
    const { keyName, offset, count } = dto;
    let result: GetListElementsResponse;
    try {
      const total = await this.browserTool.execCommand(
        clientMetadata,
        BrowserToolListCommands.LLen,
        [keyName],
      );
      if (!total) {
        this.logger.error(
          `Failed to get elements of the list. Key not found. key: ${keyName}`,
        );
        return Promise.reject(
          new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST),
        );
      }
      const elements = await this.browserTool.execCommand(
        clientMetadata,
        BrowserToolListCommands.Lrange,
        [keyName, offset, offset + count - 1],
      );
      this.logger.log('Succeed to get elements of the list.');
      result = { keyName, total, elements };
    } catch (error) {
      this.logger.error('Failed to to get elements of the list.', error);
      if (error?.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      catchAclError(error);
    }
    return plainToClass(GetListElementsResponse, result);
  }

  /**
   * Get List element by index
   * NotFound exception when redis return null
   * @param clientMetadata
   * @param index
   * @param dto
   */
  public async getElement(
    clientMetadata: ClientMetadata,
    index: number,
    dto: KeyDto,
  ): Promise<GetListElementResponse> {
    this.logger.log('Getting List element by index.');
    const { keyName } = dto;
    try {
      const exists = await this.browserTool.execCommand(
        clientMetadata,
        BrowserToolKeysCommands.Exists,
        [keyName],
      );

      if (!exists) {
        return Promise.reject(
          new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST),
        );
      }

      const value = await this.browserTool.execCommand(
        clientMetadata,
        BrowserToolListCommands.LIndex,
        [keyName, index],
      );

      if (value === null) {
        return Promise.reject(
          new NotFoundException(ERROR_MESSAGES.INDEX_OUT_OF_RANGE()),
        );
      }
      this.logger.log('Succeed to get List element by index.');
      return plainToClass(GetListElementResponse, { keyName, value });
    } catch (error) {
      this.logger.error('Failed to to get List element by index.', error);
      if (error?.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      throw catchAclError(error);
    }
  }

  public async setElement(
    clientMetadata: ClientMetadata,
    dto: SetListElementDto,
  ): Promise<SetListElementResponse> {
    this.logger.log('Setting the list element at index');
    const { keyName, element, index } = dto;
    try {
      const isExist = await this.browserTool.execCommand(
        clientMetadata,
        BrowserToolKeysCommands.Exists,
        [keyName],
      );
      if (!isExist) {
        this.logger.error(
          `Failed to set the list element at index. ${ERROR_MESSAGES.KEY_NOT_EXIST} key: ${keyName}`,
        );
        return Promise.reject(
          new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST),
        );
      }
      await this.browserTool.execCommand(
        clientMetadata,
        BrowserToolListCommands.LSet,
        [keyName, index, element],
      );
      this.logger.log('Succeed to set the list element at index.');
    } catch (error) {
      if (error?.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      if (error?.message.includes('index out of range')) {
        throw new BadRequestException(error.message);
      }
      this.logger.error('Failed to set the list element at index.', error);
      catchAclError(error);
    }
    return plainToClass(SetListElementResponse, { index, element });
  }

  /**
   * Delete and return the elements from the tail/head of list stored at key
   * NotFound exception when redis return null
   * @param clientMetadata
   * @param dto
   */
  public async deleteElements(
    clientMetadata: ClientMetadata,
    dto: DeleteListElementsDto,
  ): Promise<DeleteListElementsResponse> {
    this.logger.log('Deleting elements from the list stored at key.');
    const { keyName, count, destination } = dto;
    try {
      const execArgs = !!count && count > 1 ? [keyName, count] : [keyName];
      let result;
      if (destination === ListElementDestination.Head) {
        result = await this.browserTool.execCommand(
          clientMetadata,
          BrowserToolListCommands.LPop,
          execArgs,
        );
      } else {
        result = await this.browserTool.execCommand(
          clientMetadata,
          BrowserToolListCommands.RPop,
          execArgs,
        );
      }
      if (isNull(result)) {
        return Promise.reject(
          new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST),
        );
      }
      return plainToClass(DeleteListElementsResponse, {
        elements: isArray(result) ? [...result] : [result],
      });
    } catch (error) {
      this.logger.error('Failed to delete elements from the list stored at key.', error);
      if (error?.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      if (
        error?.message.includes('wrong number of arguments')
        && error?.command?.args?.length === 2
      ) {
        throw new BadRequestException(
          ERROR_MESSAGES.REMOVING_MULTIPLE_ELEMENTS_NOT_SUPPORT(),
        );
      }
      throw catchAclError(error);
    }
  }

  public async createSimpleList(
    clientMetadata: ClientMetadata,
    dto: PushElementToListDto,
  ): Promise<void> {
    const { keyName, element } = dto;

    await this.browserTool.execCommand(
      clientMetadata,
      BrowserToolListCommands.LPush,
      [keyName, element],
    );
  }

  public async createListWithExpiration(
    clientMetadata: ClientMetadata,
    dto: CreateListWithExpireDto,
  ): Promise<void> {
    const { keyName, element, expire } = dto;
    const [
      transactionError,
      transactionResults,
    ] = await this.browserTool.execMulti(clientMetadata, [
      [BrowserToolListCommands.LPush, keyName, element],
      [BrowserToolKeysCommands.Expire, keyName, expire],
    ]);
    catchTransactionError(transactionError, transactionResults);
  }
}
