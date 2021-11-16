import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as isGlob from 'is-glob';
import { RedisErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';
import config from 'src/utils/config';
import { catchAclError, catchTransactionError, unescapeGlob } from 'src/utils';
import { ReplyError } from 'src/models';
import { IFindRedisClientInstanceByOptions } from 'src/modules/core/services/redis/redis.service';
import {
  BrowserToolKeysCommands,
  BrowserToolSetCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import {
  AddMembersToSetDto,
  CreateSetWithExpireDto,
  DeleteMembersFromSetDto,
  DeleteMembersFromSetResponse,
  GetSetMembersDto,
  GetSetMembersResponse,
  RedisDataType,
  SetScanResponse,
} from '../../dto';
import { BrowserToolService } from '../browser-tool/browser-tool.service';
import { BrowserAnalyticsService } from '../browser-analytics/browser-analytics.service';

const REDIS_SCAN_CONFIG = config.get('redis_scan');

@Injectable()
export class SetBusinessService {
  private logger = new Logger('SetBusinessService');

  constructor(
    private browserTool: BrowserToolService,
    private browserAnalyticsService: BrowserAnalyticsService,
  ) {}

  public async createSet(
    clientOptions: IFindRedisClientInstanceByOptions,
    dto: CreateSetWithExpireDto,
  ): Promise<void> {
    this.logger.log('Creating Set data type.');
    const { keyName } = dto;
    try {
      const isExist = await this.browserTool.execCommand(
        clientOptions,
        BrowserToolKeysCommands.Exists,
        [keyName],
      );
      if (isExist) {
        this.logger.error(
          `Failed to create Set data type. ${ERROR_MESSAGES.KEY_NAME_EXIST} key: ${keyName}`,
        );
        return Promise.reject(
          new ConflictException(ERROR_MESSAGES.KEY_NAME_EXIST),
        );
      }
      if (dto.expire) {
        await this.createSetWithExpiration(clientOptions, dto);
      } else {
        await this.createSimpleSet(clientOptions, dto);
      }
      this.browserAnalyticsService.sendKeyAddedEvent(
        clientOptions.instanceId,
        RedisDataType.Set,
        {
          length: dto.members.length,
          TTL: dto.expire || -1,
        },
      );
      this.logger.log('Succeed to create Set data type.');
    } catch (error) {
      if (error?.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      this.logger.error('Failed to create Set data type.', error);
      catchAclError(error);
    }
    return null;
  }

  public async getMembers(
    clientOptions: IFindRedisClientInstanceByOptions,
    dto: GetSetMembersDto,
  ): Promise<GetSetMembersResponse> {
    this.logger.log('Getting members of the Set data type stored at key.');
    const { keyName } = dto;
    let result: GetSetMembersResponse = {
      keyName,
      total: 0,
      members: [],
      nextCursor: dto.cursor,
    };

    try {
      result.total = await this.browserTool.execCommand(
        clientOptions,
        BrowserToolSetCommands.SCard,
        [keyName],
      );
      if (!result.total) {
        this.logger.error(
          `Failed to get members of the Set data type. Not Found key: ${keyName}.`,
        );
        return Promise.reject(
          new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST),
        );
      }
      if (dto.match && !isGlob(dto.match, { strict: false })) {
        const member = unescapeGlob(dto.match);
        result.nextCursor = 0;
        const memberIsExist = await this.browserTool.execCommand(
          clientOptions,
          BrowserToolSetCommands.SIsMember,
          [keyName, member],
        );
        if (memberIsExist) {
          result.members.push(member);
        }
      } else {
        const scanResult = await this.scanSet(clientOptions, dto);
        result = { ...result, ...scanResult };
      }
      this.browserAnalyticsService.sendKeyScannedEvent(
        clientOptions.instanceId,
        RedisDataType.Set,
        dto.match,
        {
          length: result.total,
        },
      );
      this.logger.log('Succeed to get members of the Set data type.');
      return result;
    } catch (error) {
      this.logger.error('Failed to get members of the Set data type.', error);
      if (error?.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      throw catchAclError(error);
    }
  }

  public async addMembers(
    clientOptions: IFindRedisClientInstanceByOptions,
    dto: AddMembersToSetDto,
  ): Promise<void> {
    this.logger.log('Adding members to the Set data type.');
    const { keyName, members } = dto;
    try {
      const isExist = await this.browserTool.execCommand(
        clientOptions,
        BrowserToolKeysCommands.Exists,
        [keyName],
      );
      if (!isExist) {
        this.logger.error(
          `Failed to add members to Set data type. ${ERROR_MESSAGES.KEY_NOT_EXIST} key: ${keyName}`,
        );
        return Promise.reject(
          new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST),
        );
      }
      const added = await this.browserTool.execCommand(
        clientOptions,
        BrowserToolSetCommands.SAdd,
        [keyName, ...members],
      );
      if (added) {
        this.browserAnalyticsService.sendKeyValueAddedEvent(
          clientOptions.instanceId,
          RedisDataType.Set,
          {
            numberOfAdded: added,
          },
        );
      }
      this.logger.log('Succeed to add members to Set data type.');
    } catch (error) {
      this.logger.error('Failed to add members to Set data type.', error);
      if (error?.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      catchAclError(error);
    }
    return null;
  }

  public async deleteMembers(
    clientOptions: IFindRedisClientInstanceByOptions,
    dto: DeleteMembersFromSetDto,
  ): Promise<DeleteMembersFromSetResponse> {
    this.logger.log('Deleting members from the Set data type.');
    const { keyName, members } = dto;
    let result;
    try {
      const isExist = await this.browserTool.execCommand(
        clientOptions,
        BrowserToolKeysCommands.Exists,
        [keyName],
      );
      if (!isExist) {
        this.logger.error(
          `Failed to delete members from the Set data type. ${ERROR_MESSAGES.KEY_NOT_EXIST} key: ${keyName}`,
        );
        return Promise.reject(
          new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST),
        );
      }
      result = await this.browserTool.execCommand(
        clientOptions,
        BrowserToolSetCommands.SRem,
        [keyName, ...members],
      );
      if (result) {
        this.browserAnalyticsService.sendKeyValueRemovedEvent(
          clientOptions.instanceId,
          RedisDataType.Set,
          {
            numberOfRemoved: result,
          },
        );
      }
    } catch (error) {
      this.logger.error('Failed to delete members from the Set data type.', error);
      if (error?.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      catchAclError(error);
    }
    this.logger.log('Succeed to delete members from the Set data type.');
    return { affected: result };
  }

  public async createSimpleSet(
    clientOptions: IFindRedisClientInstanceByOptions,
    dto: AddMembersToSetDto,
  ): Promise<number> {
    const { keyName, members } = dto;

    return await this.browserTool.execCommand(
      clientOptions,
      BrowserToolSetCommands.SAdd,
      [keyName, ...members],
    );
  }

  public async createSetWithExpiration(
    clientOptions: IFindRedisClientInstanceByOptions,
    dto: CreateSetWithExpireDto,
  ): Promise<number> {
    const { keyName, members, expire } = dto;

    const [
      transactionError,
      transactionResults,
    ] = await this.browserTool.execMulti(clientOptions, [
      [BrowserToolSetCommands.SAdd, keyName, ...members],
      [BrowserToolKeysCommands.Expire, keyName, expire],
    ]);
    catchTransactionError(transactionError, transactionResults);
    const execResult = transactionResults.map(
      (item: [ReplyError, any]) => item[1],
    );
    const [added] = execResult;
    return added;
  }

  public async scanSet(
    clientOptions: IFindRedisClientInstanceByOptions,
    dto: GetSetMembersDto,
  ): Promise<SetScanResponse> {
    const { keyName } = dto;
    const count = dto.count || REDIS_SCAN_CONFIG.countDefault;
    const match = dto.match !== undefined ? dto.match : '*';
    let result: SetScanResponse = {
      keyName,
      nextCursor: null,
      members: [],
    };

    while (result.nextCursor !== 0 && result.members.length < count) {
      const scanResult = await this.browserTool.execCommand(
        clientOptions,
        BrowserToolSetCommands.SScan,
        [
          keyName,
          `${result.nextCursor || dto.cursor}`,
          'MATCH',
          match,
          'COUNT',
          count,
        ],
      );
      const [nextCursor, members] = scanResult;
      result = {
        ...result,
        nextCursor: parseInt(nextCursor, 10),
        members: [...result.members, ...members],
      };
    }
    return result;
  }
}
