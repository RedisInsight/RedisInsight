import * as Redis from 'ioredis';
import { Injectable, Logger } from '@nestjs/common';
import { ReplyError } from 'src/models';
import {
  RedisService,
} from 'src/modules/redis/redis.service';
import { RedisConsumerAbstractService } from 'src/modules/redis/redis-consumer.abstract.service';
import { BrowserToolCommands } from 'src/modules/browser/constants/browser-tool-commands';
import { getRedisPipelineSummary } from 'src/utils/cli-helper';
import { getConnectionName } from 'src/utils/redis-connection-helper';
import { DatabaseService } from 'src/modules/database/database.service';
import { ClientContext, ClientMetadata } from 'src/common/models';
import { RedisConnectionFactory } from 'src/modules/redis/redis-connection.factory';

@Injectable()
export class BrowserToolService extends RedisConsumerAbstractService {
  private logger = new Logger('BrowserToolService');

  constructor(
    protected redisService: RedisService,
    protected redisConnectionFactory: RedisConnectionFactory,
    protected databaseService: DatabaseService,
  ) {
    super(ClientContext.Browser, redisService, redisConnectionFactory, databaseService);
  }

  async execCommand(
    clientMetadata: ClientMetadata,
    toolCommand: BrowserToolCommands,
    args: Array<string | number | Buffer>,
    replyEncoding: BufferEncoding = null,
  ): Promise<any> {
    const client = await this.getRedisClient(clientMetadata);
    this.logger.log(`Execute command '${toolCommand}', connectionName: ${getConnectionName(client)}`);
    const [command, ...commandArgs] = toolCommand.split(' ');
    return client.sendCommand(
      new Redis.Command(command, [...commandArgs, ...args], {
        replyEncoding,
      }),
    );
  }

  async execPipeline(
    clientMetadata: ClientMetadata,
    toolCommands: Array<[toolCommand: BrowserToolCommands, ...args: Array<string | number | Buffer>]>,
  ): Promise<[ReplyError | null, any]> {
    const client = await this.getRedisClient(clientMetadata);
    const pipelineSummery = getRedisPipelineSummary(toolCommands);
    this.logger.log(
      `Execute pipeline ${pipelineSummery.summary}, length: ${pipelineSummery.length}, connectionName: ${getConnectionName(client)}`,
    );
    return this.execPipelineFromClient(client, toolCommands);
  }

  async execMulti(
    clientMetadata: ClientMetadata,
    toolCommands: Array<[toolCommand: BrowserToolCommands, ...args: Array<string | number | Buffer>]>,
  ): Promise<[ReplyError | null, any]> {
    const client = await this.getRedisClient(clientMetadata);
    const pipelineSummery = getRedisPipelineSummary(toolCommands);
    this.logger.log(
      `Execute pipeline ${pipelineSummery.summary}, length: ${pipelineSummery.length}, connectionName: ${getConnectionName(client)}`,
    );
    return this.execMultiFromClient(client, toolCommands);
  }
}
