import { Logger } from '@nestjs/common';
import * as Redis from 'ioredis';
import IORedis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { AppTool, ReplyError } from 'src/models';
import ERROR_MESSAGES from 'src/constants/error-messages';
import {
  IFindRedisClientInstanceByOptions,
  RedisService,
} from 'src/modules/core/services/redis/redis.service';
import { RedisConsumerAbstractService } from 'src/modules/shared/services/base/redis-consumer.abstract.service';
import { InstancesBusinessService } from 'src/modules/shared/services/instances-business/instances-business.service';
import {
  ClusterNodeNotFoundError,
  WrongDatabaseTypeError,
} from 'src/modules/cli/constants/errors';
import {
  ClusterNodeRole,
  CommandExecutionStatus,
} from 'src/modules/cli/dto/cli.dto';
import { getConnectionName } from 'src/utils/redis-connection-helper';

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
    private appTool: AppTool,
    protected redisService: RedisService,
    protected instancesBusinessService: InstancesBusinessService,
  ) {
    super(appTool, redisService, instancesBusinessService);
    this.logger = new Logger(`${appTool}ToolService`);
  }

  async execCommand(
    clientOptions: IFindRedisClientInstanceByOptions,
    toolCommand: string,
    args: Array<string | Buffer>,
    replyEncoding?: string,
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

  async execCommandForNodes(
    clientOptions: IFindRedisClientInstanceByOptions,
    toolCommand: string,
    args: Array<string | Buffer>,
    nodeRole: ClusterNodeRole,
    replyEncoding?: string,
  ): Promise<ICliExecResultFromNode[]> {
    const [command, ...commandArgs] = toolCommand.split(' ');
    const nodes: IORedis.Redis[] = await this.getClusterNodes(
      clientOptions,
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
    clientOptions: IFindRedisClientInstanceByOptions,
    toolCommand: string,
    args: Array<string | Buffer>,
    nodeRole: ClusterNodeRole,
    nodeAddress: string,
    replyEncoding?: string,
  ): Promise<ICliExecResultFromNode> {
    const [command, ...commandArgs] = toolCommand.split(' ');
    const nodes: IORedis.Redis[] = await this.getClusterNodes(
      clientOptions,
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

  async createNewToolClient(instanceId: string, namespace: string): Promise<string> {
    const uuid = uuidv4();
    await this.createNewClient(instanceId, uuid, namespace);

    return uuid;
  }

  async reCreateToolClient(instanceId: string, uuid: string, namespace: string): Promise<string> {
    this.redisService.removeClientInstance({
      instanceId,
      uuid,
      tool: this.consumer,
    });
    await this.createNewClient(instanceId, uuid, namespace);

    return uuid;
  }

  async deleteToolClient(instanceId: string, uuid: string): Promise<number> {
    return this.redisService.removeClientInstance({
      instanceId,
      uuid,
      tool: this.consumer,
    });
  }

  private async getClusterNodes(
    clientOptions: IFindRedisClientInstanceByOptions,
    role: ClusterNodeRole,
  ): Promise<IORedis.Redis[]> {
    const client = await this.getRedisClient(clientOptions);
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
