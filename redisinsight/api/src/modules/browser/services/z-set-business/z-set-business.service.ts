import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { isNull, isNaN } from 'lodash';
import * as isGlob from 'is-glob';
import config from 'src/utils/config';
import { catchAclError, catchTransactionError, unescapeGlob } from 'src/utils';
import {
  AddMembersToZSetDto,
  CreateZSetWithExpireDto,
  DeleteMembersFromZSetDto,
  DeleteMembersFromZSetResponse,
  GetZSetMembersDto,
  GetZSetResponse,
  ScanZSetResponse,
  SearchZSetMembersDto,
  SearchZSetMembersResponse,
  UpdateMemberInZSetDto,
  ZSetMemberDto,
} from 'src/modules/browser/dto';
import { SortOrder } from 'src/constants/sort';
import { RedisErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { ReplyError } from 'src/models';
import { IFindRedisClientInstanceByOptions } from 'src/modules/core/services/redis/redis.service';
import { BrowserToolService } from 'src/modules/browser/services/browser-tool/browser-tool.service';
import {
  BrowserToolKeysCommands,
  BrowserToolZSetCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { plainToClass } from 'class-transformer';

const REDIS_SCAN_CONFIG = config.get('redis_scan');

@Injectable()
export class ZSetBusinessService {
  private logger = new Logger('ZSetBusinessService');

  constructor(
    private browserTool: BrowserToolService,
  ) {}

  public async createZSet(
    clientOptions: IFindRedisClientInstanceByOptions,
    dto: CreateZSetWithExpireDto,
  ): Promise<void> {
    this.logger.log('Creating ZSet data type.');
    const { keyName } = dto;
    try {
      const isExist = await this.browserTool.execCommand(
        clientOptions,
        BrowserToolKeysCommands.Exists,
        [keyName],
      );
      if (isExist) {
        this.logger.error(
          `Failed to create ZSet data type. ${ERROR_MESSAGES.KEY_NAME_EXIST} key: ${keyName}`,
        );
        return Promise.reject(
          new ConflictException(ERROR_MESSAGES.KEY_NAME_EXIST),
        );
      }
      if (dto.expire) {
        await this.createZSetWithExpiration(clientOptions, dto);
      } else {
        await this.createSimpleZSet(clientOptions, dto);
      }
      this.logger.log('Succeed to create ZSet data type.');
    } catch (error) {
      if (error?.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      this.logger.error('Failed to create ZSet data type.', error);
      catchAclError(error);
    }
    return null;
  }

  public async getMembers(
    clientOptions: IFindRedisClientInstanceByOptions,
    getZSetDto: GetZSetMembersDto,
  ): Promise<GetZSetResponse> {
    this.logger.log('Getting members of the ZSet data type stored at key.');
    const { keyName, sortOrder } = getZSetDto;
    let result: GetZSetResponse;
    try {
      const total = await this.browserTool.execCommand(
        clientOptions,
        BrowserToolZSetCommands.ZCard,
        [keyName],
      );
      if (!total) {
        this.logger.error(
          `Failed to get members of the ZSet data type. Not Found key: ${keyName}.`,
        );
        return Promise.reject(
          new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST),
        );
      }
      let members: ZSetMemberDto[] = [];

      if (sortOrder && sortOrder === SortOrder.Asc) {
        members = await this.getZRange(clientOptions, getZSetDto);
      } else {
        members = await this.getZRevRange(clientOptions, getZSetDto);
      }

      this.logger.log('Succeed to get members of the ZSet data type.');
      result = {
        keyName,
        total,
        members,
      };
    } catch (error) {
      this.logger.error('Failed to get members of the ZSet data type.', error);
      if (error?.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      catchAclError(error);
    }
    return plainToClass(GetZSetResponse, result);
  }

  public async addMembers(
    clientOptions: IFindRedisClientInstanceByOptions,
    dto: AddMembersToZSetDto,
  ): Promise<void> {
    this.logger.log('Adding members to the ZSet data type.');
    const { keyName, members } = dto;
    try {
      const isExist = await this.browserTool.execCommand(
        clientOptions,
        BrowserToolKeysCommands.Exists,
        [keyName],
      );
      if (!isExist) {
        this.logger.error(
          `Failed to add members to ZSet data type. ${ERROR_MESSAGES.KEY_NOT_EXIST} key: ${keyName}`,
        );
        return Promise.reject(
          new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST),
        );
      }
      const args = this.formatMembersDtoToCommandArgs(members);
      await this.browserTool.execCommand(
        clientOptions,
        BrowserToolZSetCommands.ZAdd,
        [keyName, ...args],
      );
      this.logger.log('Succeed to add members to ZSet data type.');
    } catch (error) {
      this.logger.error('Failed to add members to Set data type.', error);
      if (error?.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      catchAclError(error);
    }
    return null;
  }

  public async updateMember(
    clientOptions: IFindRedisClientInstanceByOptions,
    dto: UpdateMemberInZSetDto,
  ): Promise<void> {
    this.logger.log('Updating member in ZSet data type.');
    const { keyName, member } = dto;
    try {
      const isExist = await this.browserTool.execCommand(
        clientOptions,
        BrowserToolKeysCommands.Exists,
        [keyName],
      );
      if (!isExist) {
        this.logger.error(
          `Failed to update member in ZSet data type. ${ERROR_MESSAGES.KEY_NOT_EXIST} key: ${keyName}`,
        );
        return Promise.reject(
          new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST),
        );
      }
      const result = await this.browserTool.execCommand(
        clientOptions,
        BrowserToolZSetCommands.ZAdd,
        [keyName, 'XX', 'CH', `${member.score}`, member.name],
      );
      if (!result) {
        this.logger.error(
          `Failed to update member in ZSet data type. ${ERROR_MESSAGES.MEMBER_IN_SET_NOT_EXIST}`,
        );
        return Promise.reject(
          new NotFoundException(ERROR_MESSAGES.MEMBER_IN_SET_NOT_EXIST),
        );
      }
      this.logger.log('Succeed to update member in ZSet data type.');
    } catch (error) {
      this.logger.error('Failed to update member in ZSet data type.', error);
      if (error?.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      catchAclError(error);
    }
    return null;
  }

  public async deleteMembers(
    clientOptions: IFindRedisClientInstanceByOptions,
    dto: DeleteMembersFromZSetDto,
  ): Promise<DeleteMembersFromZSetResponse> {
    this.logger.log('Deleting members from the ZSet data type.');
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
          `Failed to delete members from the ZSet data type. ${ERROR_MESSAGES.KEY_NOT_EXIST} key: ${keyName}`,
        );
        return Promise.reject(
          new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST),
        );
      }
      result = await this.browserTool.execCommand(
        clientOptions,
        BrowserToolZSetCommands.ZRem,
        [keyName, ...members],
      );
    } catch (error) {
      this.logger.error('Failed to delete members from the ZSet data type.', error);
      if (error?.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      catchAclError(error);
    }
    this.logger.log('Succeed to delete members from the ZSet data type.');
    return { affected: result };
  }

  public async searchMembers(
    clientOptions: IFindRedisClientInstanceByOptions,
    dto: SearchZSetMembersDto,
  ): Promise<SearchZSetMembersResponse> {
    this.logger.log('Search members of the ZSet data type stored at key.');
    const { keyName } = dto;
    let result: SearchZSetMembersResponse = {
      keyName,
      total: 0,
      members: [],
      nextCursor: dto.cursor,
    };
    try {
      result.total = await this.browserTool.execCommand(
        clientOptions,
        BrowserToolZSetCommands.ZCard,
        [keyName],
      );
      if (!result.total) {
        this.logger.error(
          `Failed to search members of the ZSet data type. Not Found key: ${keyName}.`,
        );
        return Promise.reject(
          new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST),
        );
      }
      if (dto.match && !isGlob(dto.match, { strict: false })) {
        const member = unescapeGlob(dto.match);
        result.nextCursor = 0;
        const score = await this.browserTool.execCommand(
          clientOptions,
          BrowserToolZSetCommands.ZScore,
          [keyName, member],
        );
        if (!isNull(score)) {
          result.members.push(plainToClass(ZSetMemberDto, { name: member, score }));
        }
      } else {
        const scanResult = await this.scanZSet(clientOptions, dto);
        result = { ...result, ...scanResult };
      }
      this.logger.log('Succeed to search members of the ZSet data type.');
      return plainToClass(SearchZSetMembersResponse, result);
    } catch (error) {
      this.logger.error('Failed to search members of the ZSet data type.', error);

      if (error?.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }

      throw catchAclError(error);
    }
  }

  public async getZRange(
    clientOptions: IFindRedisClientInstanceByOptions,
    getZSetDto: GetZSetMembersDto,
  ): Promise<ZSetMemberDto[]> {
    const { keyName, offset, count } = getZSetDto;

    const execResult = await this.browserTool.execCommand(
      clientOptions,
      BrowserToolZSetCommands.ZRange,
      [keyName, offset, offset + count - 1, 'WITHSCORES'],
    );

    return this.formatZRangeWithScoresReply(execResult);
  }

  public async getZRevRange(
    clientOptions: IFindRedisClientInstanceByOptions,
    getZSetDto: GetZSetMembersDto,
  ): Promise<ZSetMemberDto[]> {
    const { keyName, offset, count } = getZSetDto;

    const execResult = await this.browserTool.execCommand(
      clientOptions,
      BrowserToolZSetCommands.ZRevRange,
      [keyName, offset, offset + count - 1, 'WITHSCORES'],
    );

    return this.formatZRangeWithScoresReply(execResult);
  }

  public async createSimpleZSet(
    clientOptions: IFindRedisClientInstanceByOptions,
    dto: CreateZSetWithExpireDto,
  ): Promise<number> {
    const { keyName, members } = dto;
    const args = this.formatMembersDtoToCommandArgs(members);

    return await this.browserTool.execCommand(
      clientOptions,
      BrowserToolZSetCommands.ZAdd,
      [keyName, ...args],
    );
  }

  public async createZSetWithExpiration(
    clientOptions: IFindRedisClientInstanceByOptions,
    dto: CreateZSetWithExpireDto,
  ): Promise<number> {
    const { keyName, members, expire } = dto;

    const args = this.formatMembersDtoToCommandArgs(members);
    const [
      transactionError,
      transactionResults,
    ] = await this.browserTool.execMulti(clientOptions, [
      [BrowserToolZSetCommands.ZAdd, keyName, ...args],
      [BrowserToolKeysCommands.Expire, keyName, expire],
    ]);
    catchTransactionError(transactionError, transactionResults);
    const execResult = transactionResults.map(
      (item: [ReplyError, any]) => item[1],
    );
    const [added] = execResult;
    return added;
  }

  public async scanZSet(
    clientOptions: IFindRedisClientInstanceByOptions,
    dto: SearchZSetMembersDto,
  ): Promise<ScanZSetResponse> {
    const { keyName } = dto;
    const count = dto.count || REDIS_SCAN_CONFIG.countDefault;
    const match = dto.match !== undefined ? dto.match : '*';
    let result: ScanZSetResponse = {
      keyName,
      nextCursor: null,
      members: [],
    };
    while (result.nextCursor !== 0 && result.members.length < count) {
      const scanResult = await this.browserTool.execCommand(
        clientOptions,
        BrowserToolZSetCommands.ZScan,
        [
          keyName,
          `${result.nextCursor || dto.cursor}`,
          'MATCH',
          match,
          'COUNT',
          count,
        ],
      );
      const [nextCursor, membersArray] = scanResult;
      const members: ZSetMemberDto[] = this.formatZRangeWithScoresReply(
        membersArray,
      );
      result = {
        ...result,
        nextCursor: parseInt(nextCursor, 10),
        members: [...result.members, ...members],
      };
    }
    return result;
  }

  private formatZRangeWithScoresReply(reply: string[]): ZSetMemberDto[] {
    const result: ZSetMemberDto[] = [];
    while (reply.length) {
      const member = reply.splice(0, 2);
      const score = isNaN(parseFloat(member[1])) ? member[1] : parseFloat(member[1]);
      result.push(plainToClass(ZSetMemberDto, {
        name: member[0],
        score,
      }));
    }

    return result;
  }

  private formatMembersDtoToCommandArgs(members: ZSetMemberDto[]): (string | Buffer)[] {
    return members.reduce<(string | Buffer)[]>(
      (prev: string[], cur: ZSetMemberDto) => [
        ...prev,
        ...[`${cur.score}`, cur.name],
      ],
    []);
  }
}
