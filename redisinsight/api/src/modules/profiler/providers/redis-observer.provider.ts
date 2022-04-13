import IORedis from 'ioredis';
import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { RedisObserver } from 'src/modules/profiler/models/redis.observer';
import { RedisObserverStatus } from 'src/modules/profiler/constants';
import { AppTool } from 'src/models';
import { withTimeout } from 'src/utils/promise-with-timeout';
import { InstancesBusinessService } from 'src/modules/shared/services/instances-business/instances-business.service';
import { RedisService } from 'src/modules/core/services/redis/redis.service';
import ERROR_MESSAGES from 'src/constants/error-messages';
import config from 'src/utils/config';

const serverConfig = config.get('server');

@Injectable()
export class RedisObserverProvider {
  private logger = new Logger('RedisObserverProvider');

  private redisObservers: Record<string, RedisObserver> = {};

  constructor(
    private redisService: RedisService,
    private instancesBusinessService: InstancesBusinessService,
  ) {}

  /**
   * Get existing redis observer or create a new one
   * @param instanceId
   */
  async getOrCreateObserver(instanceId: string): Promise<RedisObserver> {
    this.logger.log('Getting redis observer...');
    try {
      if (
        !this.redisObservers[instanceId]
        || this.redisObservers[instanceId].status !== RedisObserverStatus.Ready
      ) {
        const redisClient = await this.getRedisClientForInstance(instanceId);
        this.redisObservers[instanceId] = new RedisObserver(redisClient);
      }
      this.logger.log('Succeed to get monitor observer.');
      return this.redisObservers[instanceId];
    } catch (error) {
      this.logger.error(`Failed to get monitor observer. ${error.message}.`, JSON.stringify(error));
      throw error;
    }
  }

  /**
   * Get Redis Observer from existing ones
   * @param instanceId
   */
  async getObserver(instanceId: string) {
    return this.redisObservers[instanceId];
  }

  /**
   * Remove Redis Observer
   * @param instanceId
   */
  async removeObserver(instanceId: string) {
    delete this.redisObservers[instanceId];
  }

  /**
   * Get Redis existing common IORedis client for instance or create a new common connection
   * @param instanceId
   * @private
   */
  private async getRedisClientForInstance(instanceId: string): Promise<IORedis.Redis | IORedis.Cluster> {
    const tool = AppTool.Common;
    const commonClient = this.redisService.getClientInstance({ instanceId, tool })?.client;
    if (commonClient && this.redisService.isClientConnected(commonClient)) {
      return commonClient;
    }
    return withTimeout(
      this.instancesBusinessService.connectToInstance(instanceId, tool, true),
      serverConfig.requestTimeout,
      new ServiceUnavailableException(ERROR_MESSAGES.NO_CONNECTION_TO_REDIS_DB),
    );
  }
}
