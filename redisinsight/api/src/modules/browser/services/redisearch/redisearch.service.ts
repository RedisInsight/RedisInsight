import { Cluster, Command, Redis } from 'ioredis';
import { toNumber, uniq } from 'lodash';
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
} from 'src/modules/browser/dto/redisearch';
import { GetKeysWithDetailsResponse } from 'src/modules/browser/dto';
import { RedisErrorCodes } from 'src/constants';
import { plainToClass } from 'class-transformer';
import { numberWithSpaces } from 'src/utils/base.helper';
import { BrowserToolService } from '../browser-tool/browser-tool.service';

@Injectable()
export class RedisearchService {
  private logger = new Logger('RedisearchService');

  constructor(
    private browserTool: BrowserToolService,
  ) {}

  /**
   * Get list of all available redisearch indexes
   * @param clientMetadata
   */
  public async list(clientMetadata: ClientMetadata): Promise<ListRedisearchIndexesResponse> {
    this.logger.log('Getting all redisearch indexes.');

    try {
      const client = await this.browserTool.getRedisClient(clientMetadata);

      const nodes = this.getShards(client);

      const res = await Promise.all(nodes.map(async (node) => node.sendCommand(
        new Command('FT._LIST', [], { replyEncoding: 'hex' }),
      )));

      return plainToClass(ListRedisearchIndexesResponse, {
        indexes: (uniq([].concat(...res))).map((idx) => Buffer.from(idx, 'hex')),
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

      const client = await this.browserTool.getRedisClient(clientMetadata);

      try {
        const indexInfo = await client.sendCommand(new Command('FT.INFO', [dto.index], {
          replyEncoding: 'utf8',
        }));

        if (indexInfo) {
          this.logger.error(
            `Failed to create redisearch index. ${ERROR_MESSAGES.REDISEARCH_INDEX_EXIST}`,
          );
          return Promise.reject(
            new ConflictException(ERROR_MESSAGES.REDISEARCH_INDEX_EXIST),
          );
        }
      } catch (error) {
        if (!error.message?.includes('Unknown Index name')) {
          throw error;
        }
      }

      const nodes = this.getShards(client);

      const commandArgs: any[] = [
        index, 'ON', type,
      ];

      if (prefixes && prefixes.length) {
        commandArgs.push('PREFIX', prefixes.length, ...prefixes);
      }

      commandArgs.push(
        'SCHEMA', ...[].concat(...fields.map((field) => ([field.name, field.type]))),
      );

      const command = new Command('FT.CREATE', commandArgs, {
        replyEncoding: 'utf8',
      });

      await Promise.all(nodes.map(async (node) => {
        try {
          await node.sendCommand(command);
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
      let maxResults;
      const {
        index, query, offset, limit,
      } = dto;

      const client = await this.browserTool.getRedisClient(clientMetadata);

      try {
        const [[, maxSearchResults]] = await client.sendCommand(
          // response: [ [ 'MAXSEARCHRESULTS', '10000' ] ]
          new Command('FT.CONFIG', ['GET', 'MAXSEARCHRESULTS'], {
            replyEncoding: 'utf8',
          }),
        ) as [[string, string]];

        maxResults = toNumber(maxSearchResults);
      } catch (error) {
        maxResults = null;
      }

      // Workaround: recalculate limit to not query more then MAXSEARCHRESULTS
      let safeLimit = limit;
      if (maxResults && offset + limit > maxResults) {
        safeLimit = offset <= maxResults ? maxResults - offset : limit;
      }

      const [total, ...keyNames] = await client.sendCommand(
        new Command('FT.SEARCH', [index, query, 'NOCONTENT', 'LIMIT', offset, safeLimit]),
      );

      return plainToClass(GetKeysWithDetailsResponse, {
        cursor: limit + offset,
        total,
        scanned: keyNames.length + offset,
        keys: keyNames.map((name) => ({ name })),
        maxResults,
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
  private getShards(client: Redis | Cluster): Redis[] {
    if (client instanceof Cluster) {
      return client.nodes('master');
    }

    return [client];
  }
}
