import { get } from 'lodash';
import IORedis from 'ioredis';
import {
  BadRequestException, HttpException, Injectable, Logger,
} from '@nestjs/common';
import { catchAclError, convertRedisInfoReplyToObject } from 'src/utils';
import { IFindRedisClientInstanceByOptions, RedisService } from 'src/modules/core/services/redis/redis.service';
import { InstancesBusinessService } from 'src/modules/shared/services/instances-business/instances-business.service';
import { IClusterInfo } from 'src/modules/cluster-monitor/strategies/cluster.info.interface';
import { ClusterNodesInfoStrategy } from 'src/modules/cluster-monitor/strategies/cluster-nodes.info.strategy';
import { ClusterShardsInfoStrategy } from 'src/modules/cluster-monitor/strategies/cluster-shards.info.strategy';
import { ClusterDetails } from 'src/modules/cluster-monitor/models';

export enum ClusterInfoStrategies {
  CLUSTER_NODES = 'CLUSTER_NODES',
  CLUSTER_SHARDS = 'CLUSTER_SHARDS',
}

@Injectable()
export class ClusterMonitorService {
  private logger = new Logger('ClusterMonitorService');

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
    try {
      const client = await this.getClient(clientOptions);

      if (!(client instanceof IORedis.Cluster)) {
        return Promise.reject(new BadRequestException('Current database is not in a cluster mode'));
      }

      const info = convertRedisInfoReplyToObject(await client.info('server'));

      const strategy = this.getClusterInfoStrategy(get(info, 'server.redis_version'));

      return await strategy.getClusterDetails(client);
    } catch (e) {
      this.logger.error('Unable to get cluster details', e);

      if (e instanceof HttpException) {
        throw e;
      }

      throw catchAclError(e);
    }
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
