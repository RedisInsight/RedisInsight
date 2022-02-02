import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import IORedis from 'ioredis';
import { AppTool } from 'src/models';
import config from 'src/utils/config';
import { AppRedisInstanceEvents } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { withTimeout } from 'src/utils/promise-with-timeout';
import { RedisService } from 'src/modules/core/services/redis/redis.service';
import { InstancesBusinessService } from 'src/modules/shared/services/instances-business/instances-business.service';
import { IMonitorObserver, MonitorObserver, MonitorObserverStatus } from './helpers/monitor-observer';
import { IClientMonitorObserver } from './helpers/client-monitor-observer/client-monitor-observer.interface';

const serverConfig = config.get('server');

@Injectable()
export class MonitorService {
  private logger = new Logger('MonitorService');

  private monitorObservers: Record<string, IMonitorObserver> = {};

  constructor(
    private redisService: RedisService,
    private instancesBusinessService: InstancesBusinessService,
  ) {}

  async addListenerForInstance(instanceId: string, client: IClientMonitorObserver) {
    this.logger.log(`Add listener for instance: ${instanceId}.`);
    const monitorObserver = await this.getMonitorObserver(instanceId);
    await monitorObserver.subscribe(client);
  }

  removeListenerFromInstance(instanceId: string, listenerId: string) {
    this.logger.log(`Remove listener from instance: ${instanceId}.`);
    const observer = this.monitorObservers[instanceId];
    if (observer) {
      observer.unsubscribe(listenerId);
    }
  }

  @OnEvent(AppRedisInstanceEvents.Deleted)
  handleInstanceDeletedEvent(instanceId: string) {
    this.logger.log(`Handle instance deleted event. instance: ${instanceId}.`);
    try {
      const monitorObserver = this.monitorObservers[instanceId];
      if (monitorObserver) {
        monitorObserver.clear();
        delete this.monitorObservers[instanceId];
      }
    } catch (e) {
      // continue regardless of error
    }
  }

  private async getMonitorObserver(instanceId: string): Promise<IMonitorObserver> {
    this.logger.log('Getting redis monitor observer...');
    try {
      if (
        !this.monitorObservers[instanceId]
        || this.monitorObservers[instanceId].status !== MonitorObserverStatus.Ready
      ) {
        const redisClient = await this.getRedisClientForInstance(instanceId);
        this.monitorObservers[instanceId] = new MonitorObserver(redisClient);
      }
      this.logger.log('Succeed to get monitor observer.');
      return this.monitorObservers[instanceId];
    } catch (error) {
      this.logger.error(`Failed to get monitor observer. ${error.message}.`, JSON.stringify(error));
      throw error;
    }
  }

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
