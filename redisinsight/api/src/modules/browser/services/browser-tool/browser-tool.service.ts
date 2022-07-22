import * as Redis from 'ioredis';
import { Injectable, Logger } from '@nestjs/common';
import { AppTool, ReplyError } from 'src/models';
import {
  IFindRedisClientInstanceByOptions,
  RedisService,
} from 'src/modules/core/services/redis/redis.service';
import { RedisConsumerAbstractService } from 'src/modules/shared/services/base/redis-consumer.abstract.service';
import { InstancesBusinessService } from 'src/modules/shared/services/instances-business/instances-business.service';
import { BrowserToolCommands } from 'src/modules/browser/constants/browser-tool-commands';
import { getRedisPipelineSummary } from 'src/utils/cli-helper';
import { getConnectionName } from 'src/utils/redis-connection-helper';

@Injectable()
export class BrowserToolService extends RedisConsumerAbstractService {
  private logger = new Logger('BrowserToolService');

  constructor(
    protected redisService: RedisService,
    protected instancesBusinessService: InstancesBusinessService,
  ) {
    super(AppTool.Browser, redisService, instancesBusinessService);
  }

  async execCommand(
    clientOptions: IFindRedisClientInstanceByOptions,
    toolCommand: BrowserToolCommands,
    args: Array<string | number | Buffer>,
    replyEncoding: string = 'utf8',
  ): Promise<any> {
    const client = await this.getRedisClient(clientOptions);
    this.logger.log(`Execute command '${toolCommand}', connectionName: ${getConnectionName(client)}`);
    const [command, ...commandArgs] = toolCommand.split(' ');
    return client.sendCommand(
      new Redis.Command(command, [...commandArgs, ...args], {
        replyEncoding,
      }),
    );
  }

  async execPipeline(
    clientOptions: IFindRedisClientInstanceByOptions,
    toolCommands: Array<[toolCommand: BrowserToolCommands, ...args: Array<string | number>]>,
  ): Promise<[ReplyError | null, any]> {
    const client = await this.getRedisClient(clientOptions);
    const pipelineSummery = getRedisPipelineSummary(toolCommands);
    this.logger.log(
      `Execute pipeline ${pipelineSummery.summary}, length: ${pipelineSummery.length}, connectionName: ${getConnectionName(client)}`,
    );
    return this.execPipelineFromClient(client, toolCommands);
  }

  async execMulti(
    clientOptions: IFindRedisClientInstanceByOptions,
    toolCommands: Array<[toolCommand: BrowserToolCommands, ...args: Array<string | number>]>,
  ): Promise<[ReplyError | null, any]> {
    const client = await this.getRedisClient(clientOptions);
    const pipelineSummery = getRedisPipelineSummary(toolCommands);
    this.logger.log(
      `Execute pipeline ${pipelineSummery.summary}, length: ${pipelineSummery.length}, connectionName: ${getConnectionName(client)}`,
    );
    return this.execMultiFromClient(client, toolCommands);
  }
}
