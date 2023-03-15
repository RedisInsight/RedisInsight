import { Logger } from '@nestjs/common';
import * as Redis from 'ioredis';
import * as IORedis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { ReplyError } from 'src/models';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { ClientContext, ClientMetadata } from 'src/common/models';
import {
  RedisService,
} from 'src/modules/redis/redis.service';
import { RedisConsumerAbstractService } from 'src/modules/redis/redis-consumer.abstract.service';
import {
  ClusterNodeNotFoundError,
  WrongDatabaseTypeError,
} from 'src/modules/cli/constants/errors';
import {
  ClusterNodeRole,
  CommandExecutionStatus,
} from 'src/modules/cli/dto/cli.dto';
import { getConnectionName } from 'src/utils/redis-connection-helper';
import { DatabaseService } from 'src/modules/database/database.service';
import { RedisConnectionFactory } from 'src/modules/redis/redis-connection.factory';
import { IRedisToolOptions } from './redis-tool-options';

export interface ICliExecResultFromNode {
  host: string;
  port: number;
  response: any;
  status: CommandExecutionStatus;
  slot?: number;
  error?: any,
}

export class RedisToolService extends RedisConsumerAbstractService {
  private logger: Logger;

  constructor(
    private appTool: ClientContext,
    protected redisService: RedisService,
    protected redisConnectionFactory: RedisConnectionFactory,
    protected databaseService: DatabaseService,
    options: IRedisToolOptions = {},
  ) {
    super(appTool, redisService, redisConnectionFactory, databaseService, options);
    this.logger = new Logger(`${appTool}ToolService`);
  }

  async execCommand(
    clientMetadata: ClientMetadata,
    toolCommand: string,
    args: Array<string | Buffer>,
    replyEncoding?: BufferEncoding,
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

  async execCommandForNodes(
    clientMetadata: ClientMetadata,
    toolCommand: string,
    args: Array<string | Buffer>,
    nodeRole: ClusterNodeRole,
    replyEncoding?: BufferEncoding,
  ): Promise<ICliExecResultFromNode[]> {
    const [command, ...commandArgs] = toolCommand.split(' ');
    const nodes: IORedis.Redis[] = await this.getClusterNodes(
      clientMetadata,
      nodeRole,
    );
    return await Promise.all(
      nodes.map(
        async (node: any): Promise<ICliExecResultFromNode> => {
          const { host, port } = node.options;
          this.logger.log(`Execute command '${toolCommand}', connectionName: ${getConnectionName(node)}`);
          try {
            const response = await node.sendCommand(
              new Redis.Command(command, [...commandArgs, ...args], {
                replyEncoding,
              }),
            );
            return {
              host,
              port,
              response,
              status: CommandExecutionStatus.Success,
            };
          } catch (error) {
            return {
              host,
              port,
              error,
              response: error.message,
              status: CommandExecutionStatus.Fail,
            };
          }
        },
      ),
    );
  }

  async execCommandForNode(
    clientMetadata: ClientMetadata,
    toolCommand: string,
    args: Array<string | Buffer>,
    nodeRole: ClusterNodeRole,
    nodeAddress: string,
    replyEncoding?: BufferEncoding,
  ): Promise<ICliExecResultFromNode> {
    const [command, ...commandArgs] = toolCommand.split(' ');
    const nodes: IORedis.Redis[] = await this.getClusterNodes(
      clientMetadata,
      nodeRole,
    );
    let node: any = nodes.find((item: IORedis.Redis) => {
      const { host, port } = item.options;
      return `${host}:${port}` === nodeAddress;
    });
    if (!node) {
      node = nodeRole === ClusterNodeRole.All
        ? nodeAddress
        : `${nodeAddress} [${nodeRole.toLowerCase()}]`;
      throw new ClusterNodeNotFoundError(
        ERROR_MESSAGES.CLUSTER_NODE_NOT_FOUND(node),
      );
    }
    const { host, port } = node.options;
    this.logger.log(`Execute command '${toolCommand}', connectionName: ${getConnectionName(node)}`);
    try {
      const response = await node.sendCommand(
        new Redis.Command(command, [...commandArgs, ...args], {
          replyEncoding,
        }),
      );
      return {
        response,
        host,
        port,
        status: CommandExecutionStatus.Success,
      };
    } catch (error) {
      return {
        response: error.message,
        host,
        port,
        error,
        status: CommandExecutionStatus.Fail,
      };
    }
  }

  async execPipeline(): Promise<[ReplyError | null, any]> {
    throw new Error('CLI ERROR: Pipeline not supported');
  }

  async createNewToolClient(clientMetadata: ClientMetadata): Promise<string> {
    const uniqueId = uuidv4();
    await this.createNewClient({
      ...clientMetadata,
      uniqueId,
    });

    return uniqueId;
  }

  async reCreateToolClient(clientMetadata: ClientMetadata): Promise<string> {
    this.redisService.removeClientInstance(clientMetadata);
    await this.createNewClient(clientMetadata);

    return clientMetadata.uniqueId;
  }

  async deleteToolClient(clientMetadata: ClientMetadata): Promise<number> {
    return this.redisService.removeClientInstance(clientMetadata);
  }

  private async getClusterNodes(
    clientMetadata: ClientMetadata,
    role: ClusterNodeRole,
  ): Promise<IORedis.Redis[]> {
    const client = await this.getRedisClient(clientMetadata);
    if (!(client instanceof IORedis.Cluster)) {
      throw new WrongDatabaseTypeError(ERROR_MESSAGES.WRONG_DATABASE_TYPE);
    }
    let nodes: IORedis.Redis[];
    switch (role) {
      case ClusterNodeRole.Master:
        nodes = client.nodes('master');
        break;
      case ClusterNodeRole.Slave:
        nodes = client.nodes('slave');
        break;
      default:
        nodes = client.nodes('all');
    }
    return nodes;
  }
}
