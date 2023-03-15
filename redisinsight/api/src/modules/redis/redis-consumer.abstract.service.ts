import * as IORedis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { ReplyError, IRedisConsumer } from 'src/models';
import {
  catchRedisConnectionError,
  generateRedisConnectionName,
  getConnectionNamespace,
} from 'src/utils';
import {
  RedisService,
} from 'src/modules/redis/redis.service';
import { ClientNotFoundErrorException } from 'src/modules/redis/exceptions/client-not-found-error.exception';
import { IRedisToolOptions, DEFAULT_REDIS_TOOL_OPTIONS } from 'src/modules/redis/redis-tool-options';
import { DatabaseService } from 'src/modules/database/database.service';
import { ClientContext, ClientMetadata } from 'src/common/models';
import { RedisConnectionFactory } from 'src/modules/redis/redis-connection.factory';

export abstract class RedisConsumerAbstractService implements IRedisConsumer {
  protected redisService: RedisService;

  protected databaseService: DatabaseService;

  protected consumer: ClientContext;

  protected readonly redisConnectionFactory: RedisConnectionFactory;

  private readonly options: IRedisToolOptions = DEFAULT_REDIS_TOOL_OPTIONS;

  protected constructor(
    consumer: ClientContext,
    redisService: RedisService,
    redisConnectionFactory: RedisConnectionFactory,
    databaseService: DatabaseService,
    options: IRedisToolOptions = {},
  ) {
    this.consumer = consumer;
    this.options = { ...this.options, ...options };
    this.redisService = redisService;
    this.redisConnectionFactory = redisConnectionFactory;
    this.databaseService = databaseService;
  }

  abstract execCommand(
    clientMetadata: ClientMetadata,
    toolCommand: any,
    args: Array<string | number | Buffer>,
  ): any;

  abstract execPipeline(
    clientMetadata: ClientMetadata,
    toolCommands: Array<[toolCommand: any, ...args: Array<string | number | Buffer>]>,
  ): Promise<[ReplyError | null, any]>;

  private prepareCommands(
    toolCommands: Array<[toolCommand: any, ...args: Array<string | number | Buffer>]>,
  ): string[][] {
    return toolCommands.map((item) => {
      const [toolCommand, ...args] = item;
      const [command, ...commandArgs] = toolCommand.split(' ');
      return [command, ...commandArgs, ...args];
    });
  }

  async execPipelineFromClient(
    client,
    toolCommands: Array<
    [toolCommand: any, ...args: Array<string | number | Buffer>]
    >,
  ): Promise<[ReplyError | null, any]> {
    return new Promise((resolve, reject) => {
      try {
        client
          .pipeline(this.prepareCommands(toolCommands))
          .exec((error, result) => {
            resolve([error, result]);
          });
      } catch (e) {
        reject(e);
      }
    });
  }

  protected async execMultiFromClient(
    client,
    toolCommands: Array<
    [toolCommand: any, ...args: Array<string | number | Buffer>]
    >,
  ): Promise<[ReplyError | null, any]> {
    return new Promise((resolve, reject) => {
      try {
        client
          .multi(this.prepareCommands(toolCommands))
          .exec((error, result) => {
            resolve([error, result]);
          });
      } catch (e) {
        reject(e);
      }
    });
  }

  async getRedisClient(clientMetadata: ClientMetadata): Promise<any> {
    const redisClientInstance = this.redisService.getClientInstance({
      ...clientMetadata,
      context: this.consumer,
    });
    if (!redisClientInstance || !this.redisService.isClientConnected(redisClientInstance.client)) {
      this.redisService.removeClientInstance(clientMetadata);
      if (!this.options.enableAutoConnection) throw new ClientNotFoundErrorException();

      return await this.createNewClient(clientMetadata);
    }

    return redisClientInstance.client;
  }

  getRedisClientNamespace(clientMetadata: ClientMetadata): string {
    try {
      const clientInstance = this.redisService.getClientInstance({
        ...clientMetadata,
        context: this.consumer,
      });
      return clientInstance?.client ? getConnectionNamespace(clientInstance.client) : '';
    } catch (e) {
      return '';
    }
  }

  protected async createNewClient(clientMetadata: ClientMetadata): Promise<IORedis.Redis | IORedis.Cluster> {
    const instanceDto = await this.databaseService.get(clientMetadata.databaseId);
    const uniqueId = clientMetadata.uniqueId || uuidv4();
    const connectionName = generateRedisConnectionName(
      clientMetadata.context || this.consumer,
      uniqueId,
    );

    try {
      const client = await this.redisConnectionFactory.createRedisConnection(
        {
          ...clientMetadata,
          context: this.consumer,
        },
        instanceDto,
        connectionName,
      );
      return this.redisService.setClientInstance(
        {
          ...clientMetadata,
          context: clientMetadata.context || this.consumer,
        },
        client,
      )?.client;
    } catch (error) {
      throw catchRedisConnectionError(error, instanceDto);
    }
  }
}
