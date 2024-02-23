import { isUndefined, toNumber, uniq } from 'lodash';
import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  Logger,
} from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { catchAclError } from 'src/utils';
import { ClientMetadata } from 'src/common/models';
import {
  CreateRedisearchIndexDto,
  ListRedisearchIndexesResponse,
  SearchRedisearchDto,
} from 'src/modules/browser/redisearch/dto';
import { GetKeysWithDetailsResponse } from 'src/modules/browser/keys/dto';
import { DEFAULT_MATCH, RedisErrorCodes } from 'src/constants';
import { plainToClass } from 'class-transformer';
import { numberWithSpaces } from 'src/utils/base.helper';
import { BrowserHistoryMode, RedisString } from 'src/common/constants';
import { CreateBrowserHistoryDto } from 'src/modules/browser/browser-history/dto';
import { BrowserHistoryService } from 'src/modules/browser/browser-history/browser-history.service';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import {
  RedisClient,
  RedisClientCommandArgument,
  RedisClientConnectionType,
  RedisClientNodeRole,
} from 'src/modules/redis/client';

@Injectable()
export class RedisearchService {
  private maxSearchResults: Map<string, null | number> = new Map();

  private logger = new Logger('RedisearchService');

  constructor(
    private databaseClientFactory: DatabaseClientFactory,
    private browserHistory: BrowserHistoryService,
  ) {}

  /**
   * Get list of all available redisearch indexes
   * @param clientMetadata
   */
  public async list(clientMetadata: ClientMetadata): Promise<ListRedisearchIndexesResponse> {
    this.logger.log('Getting all redisearch indexes.');

    try {
      const client: RedisClient = await this.databaseClientFactory.getOrCreateClient(clientMetadata);
      const nodes = this.getShards(client) as RedisClient[];

      const res = await Promise.all(nodes.map(async (node) => node.sendCommand(
        ['FT._LIST'],
      )));

      return plainToClass(ListRedisearchIndexesResponse, {
        indexes: (uniq([].concat(...res))).map((idx) => Buffer.from(idx)),
      });
    } catch (e) {
      this.logger.error('Failed to get redisearch indexes', e);
      throw catchAclError(e);
    }
  }

  /**
   * Creates redisearch index
   * @param clientMetadata
   * @param dto
   */
  public async createIndex(
    clientMetadata: ClientMetadata,
    dto: CreateRedisearchIndexDto,
  ): Promise<void> {
    this.logger.log('Creating redisearch index.');

    try {
      const {
        index, type, prefixes, fields,
      } = dto;

      const client: RedisClient = await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      try {
        const indexInfo = await client.sendCommand([
          'FT.INFO',
          index,
        ], { replyEncoding: 'utf8' });

        if (indexInfo) {
          this.logger.error(
            `Failed to create redisearch index. ${ERROR_MESSAGES.REDISEARCH_INDEX_EXIST}`,
          );
          return Promise.reject(new ConflictException(ERROR_MESSAGES.REDISEARCH_INDEX_EXIST));
        }
      } catch (error) {
        if (!error.message?.toLowerCase()?.includes('unknown index name')) {
          throw error;
        }
      }

      const nodes = this.getShards(client) as RedisClient[];

      const commandArgs: any[] = [
        index, 'ON', type,
      ];

      if (prefixes && prefixes.length) {
        commandArgs.push('PREFIX', prefixes.length, ...prefixes);
      }

      commandArgs.push(
        'SCHEMA', ...[].concat(...fields.map((field) => ([field.name, field.type]))),
      );

      await Promise.all(nodes.map(async (node) => {
        try {
          await node.sendCommand([
            'FT.CREATE',
            ...commandArgs,
          ], { replyEncoding: 'utf8' });
        } catch (e) {
          if (!e.message.includes('MOVED')) {
            throw e;
          }
        }
      }));

      return undefined;
    } catch (e) {
      this.logger.error('Failed to create redisearch index', e);
      throw catchAclError(e);
    }
  }

  /**
   * Search for key names using RediSearch module
   * Response is the same as for keys "scan" to have the same behaviour in the browser
   * @param clientMetadata
   * @param dto
   */
  public async search(
    clientMetadata: ClientMetadata,
    dto: SearchRedisearchDto,
  ): Promise<GetKeysWithDetailsResponse> {
    this.logger.log('Searching keys using redisearch.');

    try {
      const {
        index, query, offset, limit,
      } = dto;

      const client: RedisClient = await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      if (isUndefined(this.maxSearchResults.get(clientMetadata.databaseId))) {
        try {
          const [[, maxSearchResults]] = await client.sendCommand([
            'FT.CONFIG',
            'GET',
            'MAXSEARCHRESULTS',
          ], { replyEncoding: 'utf8' }) as [[string, string]];

          this.maxSearchResults.set(clientMetadata.databaseId, toNumber(maxSearchResults));
        } catch (error) {
          this.maxSearchResults.set(clientMetadata.databaseId, null);
        }
      }
      // Workaround: recalculate limit to not query more then MAXSEARCHRESULTS
      let safeLimit = limit;
      const maxSearchResult = this.maxSearchResults.get(clientMetadata.databaseId);

      if (maxSearchResult && offset + limit > maxSearchResult) {
        safeLimit = offset <= maxSearchResult ? maxSearchResult - offset : limit;
      }

      const [total, ...keyNames] = await client.sendCommand([
        'FT.SEARCH',
        index,
        query,
        'NOCONTENT',
        'LIMIT',
        offset,
        safeLimit,
      ]) as [number, RedisString[]];

      let type;
      if (keyNames.length) {
        type = await client.sendCommand([
          'TYPE',
          keyNames[0] as unknown as RedisClientCommandArgument,
        ], { replyEncoding: 'utf8' });
      }

      // Do not save default match "*"
      if (query !== DEFAULT_MATCH) {
        await this.browserHistory.create(
          clientMetadata,
          plainToClass(
            CreateBrowserHistoryDto,
            { filter: { match: query, type: null }, mode: BrowserHistoryMode.Redisearch },
          ),
        );
      }

      return plainToClass(GetKeysWithDetailsResponse, {
        cursor: limit + offset >= total ? 0 : limit + offset,
        total,
        scanned: keyNames.length + offset,
        keys: keyNames.map((name) => ({ name, type })),
        maxResults: maxSearchResult,
      });
    } catch (e) {
      this.logger.error('Failed to search keys using redisearch index', e);
      if (e instanceof HttpException) {
        throw e;
      }
      if (e.message?.includes(RedisErrorCodes.RedisearchLimit)) {
        throw new BadRequestException(ERROR_MESSAGES.INCREASE_MINIMUM_LIMIT(numberWithSpaces(dto.limit)));
      }
      throw catchAclError(e);
    }
  }

  /**
   * Get array of shards (client per each master node)
   * for STANDALONE will return array with a single shard
   * @param client
   * @private
   */
  private getShards(client: RedisClient): Promise<RedisClient[]> | RedisClient[] {
    if (client.getConnectionType() === RedisClientConnectionType.CLUSTER) {
      return client.nodes(RedisClientNodeRole.PRIMARY);
    }

    return [client];
  }
}
