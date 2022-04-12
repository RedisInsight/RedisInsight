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
import { Socket } from 'socket.io';
import { MonitorSettings } from 'src/modules/monitor/models/monitor-settings';
import ClientMonitorObserver from 'src/modules/monitor/helpers/client-monitor-observer/client-monitor-observer';
import ClientLogsEmitter from 'src/modules/monitor/helpers/emitters/client.logs-emitter';
import { ProfilerLogFilesProvider } from 'src/modules/monitor/providers/profiler-log-files.provider';
import { IMonitorObserver, MonitorObserver, MonitorObserverStatus } from './helpers/monitor-observer';

const serverConfig = config.get('server');

@Injectable()
export class MonitorService {
  private logger = new Logger('MonitorService');

  private monitorObservers: Record<string, IMonitorObserver> = {};

  private clientObservers: Record<string, ClientMonitorObserver> = {};

  constructor(
    private redisService: RedisService,
    private instancesBusinessService: InstancesBusinessService,
    private profilerLogFilesProvider: ProfilerLogFilesProvider,
  ) {}

  /**
   * Create or use existing user client to send monitor data from redis client to the user
   * We are storing user clients to have a possibility to "pause" logs without disconnecting
   *
   * @param instanceId
   * @param client
   * @param settings
   */
  async addListenerForInstance(instanceId: string, client: Socket, settings: MonitorSettings = null) {
    this.logger.log(`Add listener for instance: ${instanceId}.`);

    let clientObserver = this.clientObservers[client.id];

    if (!clientObserver) {
      clientObserver = new ClientMonitorObserver(client.id, client);
      clientObserver.addLogsEmitter(new ClientLogsEmitter(client));

      if (settings?.logFileId) {
        const profilerLogFile = await this.profilerLogFilesProvider.getOrCreate(settings.logFileId);

        // set database alias as part of the log file name
        const alias = (await this.instancesBusinessService.getOneById(instanceId)).name;
        profilerLogFile.setAlias(alias);

        clientObserver.addLogsEmitter(await profilerLogFile.getEmitter());
      }
    }

    const monitorObserver = await this.getMonitorObserver(instanceId);
    await monitorObserver.subscribe(clientObserver);
  }

  /**
   * Basically used to remove listener that triggered by user action, e.g. "pause" action
   * @param instanceId
   * @param listenerId
   */
  async removeListenerFromInstance(instanceId: string, listenerId: string) {
    this.logger.log(`Remove listener from instance: ${instanceId}.`);
    const observer = this.monitorObservers[instanceId];
    if (observer) {
      observer.unsubscribe(listenerId);
    }
  }

  async disconnectListenerFromInstance(instanceId: string, listenerId: string) {
    this.logger.log(`Remove listener from instance: ${instanceId}.`);
    const observer = this.monitorObservers[instanceId];
    if (observer) {
      observer.disconnect(listenerId);
    }
  }

  async flushLogs(instanceId: string, clientId: string) {
    this.logger.log(`Flush logs for instance ${instanceId} and client ${clientId}.`);
    const observer = this.monitorObservers[instanceId];
    if (observer) {
      // observer.unsubscribe(listenerId);
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
        delete this.clientObservers[instanceId];
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
