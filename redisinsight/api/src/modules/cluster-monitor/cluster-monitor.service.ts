import { get } from 'lodash';
import { Injectable } from '@nestjs/common';
import { IFindRedisClientInstanceByOptions, RedisService } from 'src/modules/core/services/redis/redis.service';
import { InstancesBusinessService } from 'src/modules/shared/services/instances-business/instances-business.service';
import { IClusterInfo } from 'src/modules/cluster-monitor/strategies/cluster.info.interface';
import { ClusterNodesInfoStrategy } from 'src/modules/cluster-monitor/strategies/cluster-nodes.info.strategy';
import { convertRedisInfoReplyToObject } from 'src/utils';
import { ClusterShardsInfoStrategy } from 'src/modules/cluster-monitor/strategies/cluster-shards.info.strategy';
import { ClusterDetails } from 'src/modules/cluster-monitor/dto';

export enum ClusterInfoStrategies {
  CLUSTER_NODES = 'CLUSTER_NODES',
  CLUSTER_SHARDS = 'CLUSTER_SHARDS',
}

@Injectable()
export class ClusterMonitorService {
  private infoStrategies: Map<string, IClusterInfo> = new Map();

  constructor(
    private redisService: RedisService,
    private instancesBusinessService: InstancesBusinessService,
  ) {
    this.infoStrategies.set(ClusterInfoStrategies.CLUSTER_NODES, new ClusterNodesInfoStrategy());
    this.infoStrategies.set(ClusterInfoStrategies.CLUSTER_SHARDS, new ClusterShardsInfoStrategy());
  }

  /**
   * Get cluster details and details for all nodes
   * @param clientOptions
   */
  public async getClusterDetails(clientOptions: IFindRedisClientInstanceByOptions): Promise<ClusterDetails> {
    const client = await this.getClient(clientOptions);

    const info = convertRedisInfoReplyToObject(await client.info('server'));

    const strategy = this.getClusterInfoStrategy(get(info, 'server.redis_version'));

    return await strategy.getClusterDetails(client);
  }

  /**
   * Return strategy on how we are going to fetch topology and other cluster info
   * based on Redis version
   * @param version
   * @private
   */
  private getClusterInfoStrategy(version: string): IClusterInfo {
    const intVersion = parseInt(version, 10) || 0;
    if (intVersion >= 7) {
      return this.infoStrategies.get(ClusterInfoStrategies.CLUSTER_SHARDS);
    }

    return this.infoStrategies.get(ClusterInfoStrategies.CLUSTER_NODES);
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
