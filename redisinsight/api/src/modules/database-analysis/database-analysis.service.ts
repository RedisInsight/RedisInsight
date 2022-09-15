import {
  HttpException, Injectable, Logger,
} from '@nestjs/common';
import { IFindRedisClientInstanceByOptions, RedisService } from 'src/modules/core/services/redis/redis.service';
import { InstancesBusinessService } from 'src/modules/shared/services/instances-business/instances-business.service';
import IORedis from 'ioredis';
import { catchAclError, classToClass } from 'src/utils';
import { DatabaseAnalyzer } from 'src/modules/database-analysis/analyzer/database-analyzer';
import { BrowserToolKeysCommands } from 'src/modules/browser/constants/browser-tool-commands';
import * as fs from 'fs';
import { DatabaseAnalysisEntity } from 'src/modules/database-analysis/entities/database-analysis.entity';
import { plainToClass } from 'class-transformer';

@Injectable()
export class DatabaseAnalysisService {
  private logger = new Logger('DatabaseAnalysisService');

  constructor(
    private redisService: RedisService,
    private instancesBusinessService: InstancesBusinessService,
  ) {}

  /**
   * Get cluster details and details for all nodes
   * @param clientOptions
   */
  public async create(clientOptions: IFindRedisClientInstanceByOptions): Promise<any> {
    try {
      const client = await this.getClient(clientOptions);

      let nodes = [client];

      if (client instanceof IORedis.Cluster) {
        nodes = client.nodes('master');
      }

      const [cursor, keys] = await nodes[0].sendCommand(new IORedis.Command('scan', [0, 'count', 10000]));

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
          size: sizes[i][1],
          length: sizes[i][1],
          type: types[i][1],
          ttl: ttls[i][1],
        });
      }

      // console.log('___keysData', keysData)

      fs.writeFileSync('keys.json', JSON.stringify(keysData));

      const analyzer = new DatabaseAnalyzer();
      const analysis = await analyzer.analyze(keysData);
      console.log('___analysis', analysis)

      // todo: formatter
      // classToClass(DatabaseAnalysisEntity);
      // const entity = plainToClass(DatabaseAnalysisEntity, analysis);
      // console.log(entity);

      return analysis;
    } catch (e) {
      this.logger.error('Unable to analyze database', e);

      if (e instanceof HttpException) {
        throw e;
      }

      throw catchAclError(e);
    }
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
