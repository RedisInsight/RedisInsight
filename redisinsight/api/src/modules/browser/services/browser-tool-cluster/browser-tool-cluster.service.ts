import { Injectable, Logger } from '@nestjs/common';
import IORedis, { NodeRole, Redis } from 'ioredis';
import { RedisConsumerAbstractService } from 'src/modules/redis/redis-consumer.abstract.service';
import {
  RedisService,
} from 'src/modules/redis/redis.service';
import { ClientContext, ClientMetadata, Endpoint } from 'src/common/models';
import { BrowserToolCommands } from 'src/modules/browser/constants/browser-tool-commands';
import { ClusterNodeNotFoundError } from 'src/modules/cli/constants/errors';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { getRedisPipelineSummary } from 'src/utils/cli-helper';
import { getConnectionName } from 'src/utils/redis-connection-helper';
import { DatabaseService } from 'src/modules/database/database.service';
import { RedisConnectionFactory } from 'src/modules/redis/redis-connection.factory';

export interface IExecCommandFromClusterNode {
  host: string;
  port: number;
  result: any;
}

@Injectable()
export class BrowserToolClusterService extends RedisConsumerAbstractService {
  private logger = new Logger('BrowserToolClusterService');

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
    args: Array<string | number>,
  ): Promise<any> {
    const client = await this.getRedisClient(clientMetadata);
    this.logger.log(`Execute command '${toolCommand}', connectionName: ${getConnectionName(client)}`);
    const [command, ...commandArgs] = toolCommand.split(' ');
    // TODO: use sendCommand method
    return client.call(command, [...commandArgs, ...args]);
  }

  async execPipeline(
    clientMetadata: ClientMetadata,
    toolCommands: Array<
    [toolCommand: BrowserToolCommands, ...args: Array<string | number>]
    >,
  ): Promise<any> {
    const client = await this.getRedisClient(clientMetadata);
    const pipelineSummery = getRedisPipelineSummary(toolCommands);
    this.logger.log(
      `Execute pipeline ${pipelineSummery.summary}, length: ${pipelineSummery.length}, connectionName: ${getConnectionName(client)}`,
    );
    return this.execPipelineFromClient(client, toolCommands);
  }

  async execCommandFromNodes(
    clientMetadata: ClientMetadata,
    toolCommand: BrowserToolCommands,
    args: Array<string | number>,
    nodeRole: NodeRole = 'all',
  ): Promise<IExecCommandFromClusterNode[]> {
    const client = await this.getRedisClient(clientMetadata);
    const nodes: Redis[] = client.nodes(nodeRole);
    this.logger.log(`Execute command '${toolCommand}' from nodes, connectionName: ${getConnectionName(client)}`);
    return await Promise.all(
      nodes.map(
        async (node: Redis): Promise<IExecCommandFromClusterNode> => {
          const { host, port } = node.options;
          const [command, ...commandArgs] = toolCommand.split(' ');
          const result = await node.call(command, [
            ...commandArgs,
            ...args,
          ]);
          return {
            result,
            host,
            port,
          };
        },
      ),
    );
  }

  async execCommandFromNode(
    clientMetadata: ClientMetadata,
    toolCommand: BrowserToolCommands,
    args: Array<string | number>,
    exactNode: Endpoint,
    replyEncoding: BufferEncoding = 'utf8',
  ): Promise<IExecCommandFromClusterNode> {
    const client = await this.getRedisClient(clientMetadata);
    this.logger.log(`Execute command '${toolCommand}' from node, connectionName: ${getConnectionName(client)}`);

    const [command, ...commandArgs] = toolCommand.split(' ');
    const { host, port } = exactNode;
    const allClusterNodes: Redis[] = client.nodes('all');
    const node = allClusterNodes.find((item) => {
      const { options } = item;
      return options?.host === host && options.port === port;
    });
    if (!node) {
      this.logger.error(
        `Cluster node not found. ${JSON.stringify(exactNode)}`,
      );
      throw new ClusterNodeNotFoundError(
        ERROR_MESSAGES.CLUSTER_NODE_NOT_FOUND(
          `${exactNode.host}:${exactNode.port}`,
        ),
      );
    }

    // @ts-ignore
    // There are issues with ioredis types. Here and below
    const result = await node.sendCommand(
      // @ts-ignore
      new IORedis.Command(command, [...commandArgs, ...args], {
        replyEncoding,
      }),
    );

    return {
      host,
      port,
      result,
    };
  }

  async getNodes(
    clientMetadata: ClientMetadata,
    nodeRole: NodeRole = 'all',
  ) {
    const client = await this.getRedisClient(clientMetadata);
    return client.nodes(nodeRole);
  }
}
