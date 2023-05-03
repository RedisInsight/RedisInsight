import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { RECOMMENDATION_NAMES, RedisErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';
import config from 'src/utils/config';
import {
  catchAclError, catchTransactionError, isRedisGlob, unescapeRedisGlob,
} from 'src/utils';
import { ReplyError } from 'src/models';
import { ClientMetadata } from 'src/common/models';
import {
  BrowserToolKeysCommands,
  BrowserToolSetCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { DatabaseRecommendationService } from 'src/modules/database-recommendation/database-recommendation.service';
import { plainToClass } from 'class-transformer';
import {
  AddMembersToSetDto,
  CreateSetWithExpireDto,
  DeleteMembersFromSetDto,
  DeleteMembersFromSetResponse,
  GetSetMembersDto,
  GetSetMembersResponse,
  SetScanResponse,
} from '../../dto';
import { BrowserToolService } from '../browser-tool/browser-tool.service';

const REDIS_SCAN_CONFIG = config.get('redis_scan');

@Injectable()
export class SetBusinessService {
  private logger = new Logger('SetBusinessService');

  constructor(
    private browserTool: BrowserToolService,
    private recommendationService: DatabaseRecommendationService,
  ) {}

  public async createSet(
    clientMetadata: ClientMetadata,
    dto: CreateSetWithExpireDto,
  ): Promise<void> {
    this.logger.log('Creating Set data type.');
    const { keyName } = dto;
    try {
      const isExist = await this.browserTool.execCommand(
        clientMetadata,
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
        await this.createSetWithExpiration(clientMetadata, dto);
      } else {
        await this.createSimpleSet(clientMetadata, dto);
      }
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
    clientMetadata: ClientMetadata,
    dto: GetSetMembersDto,
  ): Promise<GetSetMembersResponse> {
    const client = await this.browserTool.getRedisClient(clientMetadata);
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
        clientMetadata,
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
      if (dto.match && !isRedisGlob(dto.match)) {
        const member = unescapeRedisGlob(dto.match);
        result.nextCursor = 0;
        const memberIsExist = await this.browserTool.execCommand(
          clientMetadata,
          BrowserToolSetCommands.SIsMember,
          [keyName, member],
        );
        if (memberIsExist) {
          result.members.push(member);
        }
      } else {
        const scanResult = await this.scanSet(clientMetadata, dto);
        result = { ...result, ...scanResult };
      }
      this.recommendationService.check(
        clientMetadata,
        RECOMMENDATION_NAMES.INTEGERS_IN_SET,
        {
          members: result.members,
          keyName,
          client,
          databaseId: clientMetadata.databaseId,
        },
      );
      this.logger.log('Succeed to get members of the Set data type.');
      return plainToClass(GetSetMembersResponse, result);
    } catch (error) {
      this.logger.error('Failed to get members of the Set data type.', error);
      if (error?.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      throw catchAclError(error);
    }
  }

  public async addMembers(
    clientMetadata: ClientMetadata,
    dto: AddMembersToSetDto,
  ): Promise<void> {
    this.logger.log('Adding members to the Set data type.');
    const { keyName, members } = dto;
    try {
      const isExist = await this.browserTool.execCommand(
        clientMetadata,
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
      await this.browserTool.execCommand(
        clientMetadata,
        BrowserToolSetCommands.SAdd,
        [keyName, ...members],
      );
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
    clientMetadata: ClientMetadata,
    dto: DeleteMembersFromSetDto,
  ): Promise<DeleteMembersFromSetResponse> {
    this.logger.log('Deleting members from the Set data type.');
    const { keyName, members } = dto;
    let result;
    try {
      const isExist = await this.browserTool.execCommand(
        clientMetadata,
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
        clientMetadata,
        BrowserToolSetCommands.SRem,
        [keyName, ...members],
      );
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
    clientMetadata: ClientMetadata,
    dto: AddMembersToSetDto,
  ): Promise<number> {
    const { keyName, members } = dto;

    return await this.browserTool.execCommand(
      clientMetadata,
      BrowserToolSetCommands.SAdd,
      [keyName, ...members],
    );
  }

  public async createSetWithExpiration(
    clientMetadata: ClientMetadata,
    dto: CreateSetWithExpireDto,
  ): Promise<number> {
    const { keyName, members, expire } = dto;

    const [
      transactionError,
      transactionResults,
    ] = await this.browserTool.execMulti(clientMetadata, [
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
    clientMetadata: ClientMetadata,
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
        clientMetadata,
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
