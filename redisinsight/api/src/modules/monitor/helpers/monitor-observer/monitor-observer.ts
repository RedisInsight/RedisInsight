import { ServiceUnavailableException } from '@nestjs/common';
import IORedis from 'ioredis';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { RedisService } from 'src/modules/core/services/redis/redis.service';
import { IMonitorObserver, MonitorObserverStatus } from './monitor-observer.interface';
import { IShardObserver } from './shard-obsever.interface';
import { IClientMonitorObserver } from '../client-monitor-observer';

export class MonitorObserver implements IMonitorObserver {
  private redisService: RedisService;

  private readonly redis: IORedis.Redis | IORedis.Cluster;

  private clientMonitorObservers: Map<string, IClientMonitorObserver> = new Map();

  private shardsObservers: IShardObserver[] = [];

  public status: MonitorObserverStatus;

  constructor(
    redis: IORedis.Redis | IORedis.Cluster,
    redisService: RedisService,
  ) {
    this.redis = redis;
    this.status = MonitorObserverStatus.Wait;
    this.redisService = redisService;
  }

  public async subscribe(client: IClientMonitorObserver) {
    if (this.status !== MonitorObserverStatus.Ready) {
      await this.connect();
    }
    if (this.clientMonitorObservers.has(client.id)) {
      return;
    }
    await Promise.all(this.shardsObservers.map(async (observer) => {
      const shardClientAddress = await RedisService.getClientAddress(this.redis);
      observer.on('monitor', async (time, args, source, database) => {
        const sourceInstance = this.redisService.findClientInstanceByAddress(source);
        client.handleOnData({
          time,
          args,
          database,
          source,
          shardOptions: { ...observer.options, clientAddress: shardClientAddress },
          sourceOptions: sourceInstance ? { ...sourceInstance?.client?.options, clientAddress: source } : undefined,
        });
      });
      observer.on('end', () => {
        client.handleOnDisconnect();
        this.clear();
      });
    }));
    this.clientMonitorObservers.set(client.id, client);
  }

  public unsubscribe(id: string) {
    this.clientMonitorObservers.delete(id);
    if (this.clientMonitorObservers.size === 0) {
      this.clear();
    }
  }

  public clear() {
    this.clientMonitorObservers.clear();
    this.shardsObservers.forEach((observer) => observer.disconnect());
    this.shardsObservers = [];
    this.status = MonitorObserverStatus.End;
  }

  public getSize(): number {
    return this.clientMonitorObservers.size;
  }

  private async connect(): Promise<void> {
    try {
      if (this.redis instanceof IORedis.Cluster) {
        this.shardsObservers = await Promise.all(
          this.redis.nodes('all').filter((node) => node.status === 'ready').map(this.createShardObserver),
        );
      } else {
        this.shardsObservers = [await this.createShardObserver(this.redis)];
      }
      this.status = MonitorObserverStatus.Ready;
    } catch (error) {
      this.status = MonitorObserverStatus.Error;
      throw new ServiceUnavailableException(ERROR_MESSAGES.NO_CONNECTION_TO_REDIS_DB);
    }
  }

  private async createShardObserver(redis: IORedis.Redis): Promise<IShardObserver> {
    return await redis.monitor() as IShardObserver;
  }
}
