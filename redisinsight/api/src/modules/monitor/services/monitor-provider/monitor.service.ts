import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { RedisService } from 'src/modules/core/services/redis/redis.service';
import { InstancesBusinessService } from 'src/modules/shared/services/instances-business/instances-business.service';
import { AppTool } from 'src/models';
import { IMonitorObserver, MonitorObserver } from './monitor-observer';

@Injectable()
export class MonitorService {
  private logger = new Logger('MonitorService');

  private monitorsPool: Record<string, IMonitorObserver> = {};

  constructor(
    private redisService: RedisService,
    private instancesBusinessService: InstancesBusinessService,
  ) {}

  /**
   * Method to get Monitor observer for instance
   * @param instanceId
   */
  public async getMonitorObserver(instanceId: string): Promise<IMonitorObserver> {
    this.logger.log('Getting redis monitor emitter.');
    try {
      if (!this.monitorsPool[instanceId] || this.monitorsPool[instanceId].status !== 'ready') {
        const tool = AppTool.Common;

        let commonClient = this.redisService.getClientInstance({ instanceId, tool })?.client;
        if (!commonClient || !this.redisService.isClientConnected(commonClient)) {
          commonClient = await this.instancesBusinessService.connectToInstance(instanceId, tool, true);
        }
        this.monitorsPool[instanceId] = new MonitorObserver(commonClient);
      }
      return this.monitorsPool[instanceId];
    } catch (error) {
      this.logger.error(`Failed to get redis monitor client. ${error.message}.`, JSON.stringify(error));
      throw new InternalServerErrorException(error.message);
    }
  }
}
