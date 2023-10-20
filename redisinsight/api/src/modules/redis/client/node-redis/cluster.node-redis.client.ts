import {
  IRedisClientCommandOptions,
  NodeRedisClient,
  NodeRedisCluster,
  RedisClient,
  RedisClientCommand,
  RedisClientCommandReply,
  RedisClientConnectionType,
  RedisClientNodeRole,
  StandaloneNodeRedisClient,
} from 'src/modules/redis/client';

export class ClusterNodeRedisClient extends NodeRedisClient {
  protected readonly client: NodeRedisCluster;

  /**
   * @inheritDoc
   */
  getConnectionType(): RedisClientConnectionType {
    return RedisClientConnectionType.CLUSTER;
  }

  /**
   * @inheritDoc
   */
  async nodes(role?: RedisClientNodeRole): Promise<RedisClient[]> {
    let nodes = [];
    switch (role) {
      case RedisClientNodeRole.PRIMARY:
        nodes = this.client.masters;
        break;
      case RedisClientNodeRole.SECONDARY:
        nodes = this.client.replicas;
        break;
      default:
        nodes = this.client.masters.concat(this.client.replicas);
    }

    return nodes.map((node) => new StandaloneNodeRedisClient(this.clientMetadata, node.client));
  }

  /**
   * @inheritDoc
   */
  async sendPipeline(commands: RedisClientCommand[]): Promise<Array<[Error | null, RedisClientCommandReply]>> {
    return Promise.all(
      commands.map(
        (cmd) => this.sendCommand(cmd)
          .then((res): [null, RedisClientCommandReply] => [null, res])
          .catch((e): [Error, null] => [e, null]),
      ),
    );
  }

  /**
   * @inheritDoc
   */
  async sendCommand(
    command: RedisClientCommand,
    options?: IRedisClientCommandOptions,
  ): Promise<RedisClientCommandReply> {
    return this.client.sendCommand(
      undefined,
      false,
      NodeRedisClient.prepareCommandArgs(command),
      NodeRedisClient.prepareCommandOptions(options),
    );
  }

  /**
   * @inheritDoc
   */
  async call(command: RedisClientCommand, options?: IRedisClientCommandOptions): Promise<RedisClientCommandReply> {
    return this.sendCommand(command, options);
  }
}
