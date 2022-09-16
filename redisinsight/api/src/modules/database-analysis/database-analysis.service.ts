import {
  HttpException, Injectable, Logger,
} from '@nestjs/common';
import { IFindRedisClientInstanceByOptions, RedisService } from 'src/modules/core/services/redis/redis.service';
import { InstancesBusinessService } from 'src/modules/shared/services/instances-business/instances-business.service';
import IORedis from 'ioredis';
import { catchAclError } from 'src/utils';
import { DatabaseAnalyzer } from 'src/modules/database-analysis/providers/database-analyzer';
import { plainToClass } from 'class-transformer';
import { DatabaseAnalysis, ShortDatabaseAnalysis } from 'src/modules/database-analysis/models';
import { DatabaseAnalysisProvider } from 'src/modules/database-analysis/providers/database-analysis.provider';
import { CreateDatabaseAnalysisDto } from 'src/modules/database-analysis/dto';

@Injectable()
export class DatabaseAnalysisService {
  private logger = new Logger('DatabaseAnalysisService');

  constructor(
    private redisService: RedisService,
    private instancesBusinessService: InstancesBusinessService,
    private analyzer: DatabaseAnalyzer,
    private databaseAnalysisProvider: DatabaseAnalysisProvider,
  ) {}

  /**
   * Get cluster details and details for all nodes
   * @param clientOptions
   * @param dto
   */
  public async create(
    clientOptions: IFindRedisClientInstanceByOptions,
    dto: CreateDatabaseAnalysisDto,
  ): Promise<DatabaseAnalysis> {
    try {
      const client = await this.getClient(clientOptions);

      let nodes = [client];

      if (client instanceof IORedis.Cluster) {
        nodes = client.nodes('master');
      }

      const [cursor, keys] = await nodes[0].sendCommand(new IORedis.Command('scan', [0, 'count', 10]));

      const commands = keys.map((key) => ([
        'memory',
        'usage',
        key,
        'samples',
        '0',
      ]));

      const sizes = await nodes[0].pipeline(commands).exec();
      const types = await nodes[0].pipeline(keys.map((key) => ([
        'type',
        key,
      ]))).exec();
      const ttls = await nodes[0].pipeline(keys.map((key) => ([
        'ttl',
        key,
      ]))).exec();

      const keysData = [];
      for (let i = 0; i < keys.length; i += 1) {
        keysData.push({
          name: keys[i],
          memory: sizes[i][1],
          length: sizes[i][1],
          type: types[i][1],
          ttl: ttls[i][1],
        });
      }

      const analysis = plainToClass(DatabaseAnalysis, await this.analyzer.analyze({
        databaseId: clientOptions.instanceId,
        delimiter: dto.delimiter,
      }, keysData));

      return this.databaseAnalysisProvider.create(analysis);
      // todo: formatter
      // classToClass(DatabaseAnalysisEntity);
      // const entity = plainToClass(DatabaseAnalysisEntity, analysis);
      // console.log(entity);

      // return analysis;
      return plainToClass(DatabaseAnalysis, analysis);
    } catch (e) {
      this.logger.error('Unable to analyze database', e);

      if (e instanceof HttpException) {
        throw e;
      }

      throw catchAclError(e);
    }
  }

  /**
   * Get analysis with all fields by id
   * @param id
   */
  async get(id: string): Promise<DatabaseAnalysis> {
    return this.databaseAnalysisProvider.get(id);
  }

  /**
   * Get analysis list for particular database with id and createdAt fields only
   * @param databaseId
   */
  async list(databaseId: string): Promise<ShortDatabaseAnalysis[]> {
    return this.databaseAnalysisProvider.list(databaseId);
  }

  /**
   * Get or create redis "common" client
   *
   * @param clientOptions
   * @private
   */
  private async getClient(clientOptions: IFindRedisClientInstanceByOptions) {
    const { tool, instanceId } = clientOptions;

    const commonClient = this.redisService.getClientInstance({ instanceId, tool })?.client;

    if (commonClient && this.redisService.isClientConnected(commonClient)) {
      return commonClient;
    }

    return this.instancesBusinessService.connectToInstance(
      clientOptions.instanceId,
      clientOptions.tool,
      true,
    );
  }
}
