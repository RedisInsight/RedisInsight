import IORedis from 'ioredis';
import { ForbiddenException, ServiceUnavailableException } from '@nestjs/common';
import { RedisErrorCodes } from 'src/constants';
import { ProfilerClient } from 'src/modules/profiler/models/profiler.client';
import { RedisObserverStatus } from 'src/modules/profiler/constants';
import { IShardObserver } from 'src/modules/profiler/interfaces/shard-observer.interface';
import ERROR_MESSAGES from 'src/constants/error-messages';

export class RedisObserver {
  private readonly redis: IORedis.Redis | IORedis.Cluster;

  private profilerClients: Map<string, ProfilerClient> = new Map();

  private shardsObservers: IShardObserver[] = [];

  public status: RedisObserverStatus;

  constructor(redis: IORedis.Redis | IORedis.Cluster) {
    this.redis = redis;
    this.status = RedisObserverStatus.Wait;
  }

  /**
   * Create "monitor" clients for each shard if not exists
   * Subscribe profiler client to each each shard
   * Ignore when profiler client with such id already exists
   * @param profilerClient
   */
  public async subscribe(profilerClient: ProfilerClient) {
    if (this.status !== RedisObserverStatus.Ready) {
      await this.connect();
    }

    if (this.profilerClients.has(profilerClient.id)) {
      return;
    }

    this.shardsObservers.forEach((observer) => {
      observer.on('monitor', (time, args, source, database) => {
        profilerClient.handleOnData({
          time, args, database, source, shardOptions: observer.options,
        });
      });
      observer.on('end', () => {
        profilerClient.handleOnDisconnect();
        this.clear();
      });
    });
    this.profilerClients.set(profilerClient.id, profilerClient);
  }

  public unsubscribe(id: string) {
    this.profilerClients.delete(id);
    if (this.profilerClients.size === 0) {
      this.clear();
    }
  }

  public disconnect(id: string) {
    const userClient = this.profilerClients.get(id);
    if (userClient) {
      userClient.destroy();
    }
    this.profilerClients.delete(id);
    if (this.profilerClients.size === 0) {
      this.clear();
    }
  }

  public clear() {
    this.profilerClients.clear();
    this.shardsObservers.forEach((observer) => {
      observer.removeAllListeners('monitor');
      observer.removeAllListeners('end');
      observer.disconnect();
    });
    this.shardsObservers = [];
    this.status = RedisObserverStatus.End;
  }

  /**
   * Return number of profilerClients for current Redis Observer instance
   */
  public getProfilerClientsSize(): number {
    return this.profilerClients.size;
  }

  /**
   * Create shard observer for each Redis shard to receive "monitor" data
   * @private
   */
  private async connect(): Promise<void> {
    try {
      if (this.redis instanceof IORedis.Cluster) {
        this.shardsObservers = await Promise.all(
          this.redis.nodes('all').filter((node) => node.status === 'ready').map(RedisObserver.createShardObserver),
        );
      } else {
        this.shardsObservers = [await RedisObserver.createShardObserver(this.redis)];
      }
      this.status = RedisObserverStatus.Ready;
    } catch (error) {
      this.status = RedisObserverStatus.Error;

      if (error?.message?.includes(RedisErrorCodes.NoPermission)) {
        throw new ForbiddenException(error.message);
      }

      throw new ServiceUnavailableException(ERROR_MESSAGES.NO_CONNECTION_TO_REDIS_DB);
    }
  }

  /**
   * Create and return shard observer using IORedis common client
   * @param redis
   */
  static async createShardObserver(redis: IORedis.Redis): Promise<IShardObserver> {
    await RedisObserver.isMonitorAvailable(redis);
    return await redis.monitor() as IShardObserver;
  }

  /**
   * HACK: ioredis do not handle error when a user has no permissions to run the 'monitor' command
   * Here we try to send "monitor" command directly to throw error (like NOPERM) if any
   * @param redis
   */
  static async isMonitorAvailable(redis: IORedis.Redis): Promise<boolean> {
    // @ts-ignore
    const duplicate = redis.duplicate({
      ...redis.options,
      monitor: false,
      lazyLoading: false,
    });

    await duplicate.send_command('monitor');
    duplicate.disconnect();

    return true;
  }
}
