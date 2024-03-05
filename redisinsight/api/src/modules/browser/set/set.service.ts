import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { RedisErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';
import config from 'src/utils/config';
import {
  catchAclError, catchMultiTransactionError, isRedisGlob, unescapeRedisGlob,
} from 'src/utils';
import { ReplyError } from 'src/models';
import { ClientMetadata } from 'src/common/models';
import {
  BrowserToolKeysCommands,
  BrowserToolSetCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { plainToClass } from 'class-transformer';
import {
  AddMembersToSetDto,
  CreateSetWithExpireDto,
  DeleteMembersFromSetDto,
  DeleteMembersFromSetResponse,
  GetSetMembersDto,
  GetSetMembersResponse,
  SetScanResponse,
} from 'src/modules/browser/set/dto';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import { RedisClient } from 'src/modules/redis/client';
import { checkIfKeyExists, checkIfKeyNotExists } from 'src/modules/browser/utils';

const REDIS_SCAN_CONFIG = config.get('redis_scan');

@Injectable()
export class SetService {
  private logger = new Logger('SetService');

  constructor(private databaseClientFactory: DatabaseClientFactory) {}

  public async createSet(
    clientMetadata: ClientMetadata,
    dto: CreateSetWithExpireDto,
  ): Promise<void> {
    try {
      this.logger.log('Creating Set data type.');
      const { keyName, expire } = dto;
      const client: RedisClient = await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyExists(keyName, client);

      if (expire) {
        await this.createSetWithExpiration(client, dto);
      } else {
        await this.createSimpleSet(client, dto);
      }

      this.logger.log('Succeed to create Set data type.');
      return null;
    } catch (error) {
      if (error?.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      this.logger.error('Failed to create Set data type.', error);
      throw catchAclError(error);
    }
  }

  public async getMembers(
    clientMetadata: ClientMetadata,
    dto: GetSetMembersDto,
  ): Promise<GetSetMembersResponse> {
    try {
      this.logger.log('Getting members of the Set data type stored at key.');
      const { keyName, cursor, match } = dto;
      const client: RedisClient = await this.databaseClientFactory.getOrCreateClient(clientMetadata);
      let result: GetSetMembersResponse = {
        keyName,
        total: 0,
        members: [],
        nextCursor: cursor,
      };

      result.total = await client.sendCommand([BrowserToolSetCommands.SCard, keyName]) as number;
      if (!result.total) {
        this.logger.error(`Failed to get members of the Set data type. Not Found key: ${keyName}.`);
        return Promise.reject(new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST));
      }
      if (match && !isRedisGlob(match)) {
        const member = unescapeRedisGlob(match);
        result.nextCursor = 0;
        const memberIsExist = await client.sendCommand([
          BrowserToolSetCommands.SIsMember,
          keyName,
          member,
        ]);
        if (memberIsExist) {
          result.members.push(member);
        }
      } else {
        const scanResult = await this.scanSet(client, dto);
        result = { ...result, ...scanResult };
      }

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
    try {
      this.logger.log('Adding members to the Set data type.');
      const { keyName, members } = dto;
      const client = await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyNotExists(keyName, client);

      await client.sendCommand([BrowserToolSetCommands.SAdd, keyName, ...members]);

      this.logger.log('Succeed to add members to Set data type.');
      return null;
    } catch (error) {
      this.logger.error('Failed to add members to Set data type.', error);
      if (error?.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      throw catchAclError(error);
    }
  }

  public async deleteMembers(
    clientMetadata: ClientMetadata,
    dto: DeleteMembersFromSetDto,
  ): Promise<DeleteMembersFromSetResponse> {
    try {
      this.logger.log('Deleting members from the Set data type.');
      const { keyName, members } = dto;
      const client = await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyNotExists(keyName, client);

      const result = await client.sendCommand([
        BrowserToolSetCommands.SRem,
        keyName,
        ...members,
      ]) as number;

      this.logger.log('Succeed to delete members from the Set data type.');
      return { affected: result };
    } catch (error) {
      this.logger.error('Failed to delete members from the Set data type.', error);
      if (error?.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      throw catchAclError(error);
    }
  }

  public async createSimpleSet(
    client: RedisClient,
    dto: AddMembersToSetDto,
  ): Promise<void> {
    const { keyName, members } = dto;
    await client.sendCommand([BrowserToolSetCommands.SAdd, keyName, ...members]);
  }

  public async createSetWithExpiration(
    client: RedisClient,
    dto: CreateSetWithExpireDto,
  ): Promise<void> {
    const { keyName, members, expire } = dto;
    const transactionResults = await client.sendPipeline([
      [BrowserToolSetCommands.SAdd, keyName, ...members],
      [BrowserToolKeysCommands.Expire, keyName, expire],
    ]);
    catchMultiTransactionError(transactionResults);

    const execResult = transactionResults.map(
      (item: [ReplyError, any]) => item[1],
    );
    const [added] = execResult;
    return added;
  }

  public async scanSet(
    client: RedisClient,
    dto: GetSetMembersDto,
  ): Promise<SetScanResponse> {
    const { keyName, cursor } = dto;
    const count = dto.count || REDIS_SCAN_CONFIG.countDefault;
    const match = dto.match !== undefined ? dto.match : '*';
    let result: SetScanResponse = {
      keyName,
      nextCursor: null,
      members: [],
    };

    while (result.nextCursor !== 0 && result.members.length < count) {
      const scanResult = await client.sendCommand([
        BrowserToolSetCommands.SScan,
        keyName,
        `${result.nextCursor || cursor}`,
        'MATCH',
        match,
        'COUNT',
        count,
      ]);
      const nextCursor = scanResult[0];
      const members = scanResult[1];
      result = {
        ...result,
        nextCursor: parseInt(nextCursor, 10),
        members: [...result.members, ...members],
      };
    }
    return result;
  }
}
