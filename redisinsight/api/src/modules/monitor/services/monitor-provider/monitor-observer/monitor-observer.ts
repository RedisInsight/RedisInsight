import { Logger, ServiceUnavailableException } from '@nestjs/common';
import IORedis from 'ioredis';
import { IMonitorObserver, ObserverType, IMonitor } from './monitor-observer.interface';

export class MonitorObserver implements IMonitorObserver {
  private logger = new Logger('MonitorObserver');

  private readonly redis: IORedis.Redis | IORedis.Cluster;

  private observers: Set<ObserverType> = new Set();

  private clients: IMonitor[] = [];

  public status: string;

  constructor(redis: IORedis.Redis | IORedis.Cluster) {
    this.redis = redis;
  }

  public async subscribe(observer: ObserverType, onError?: ObserverType) {
    if (this.status !== 'ready') {
      await this.connect();
    }
    this.observers.add(observer);
    this.clients.forEach((client) => {
      this.observers.add(observer);
      client.on('monitor', observer);
      client.on('error', () => {
        onError();
        this.status = 'error';
        this.clearObservers();
      });
    });
  }

  public unsubscribe(observers: ObserverType[]) {
    observers.forEach((observer) => {
      this.observers.delete(observer);
    });
    if (this.observers.size === 0) {
      this.clearObservers();
    }
  }

  public clearObservers() {
    this.observers.clear();
    this.clients.forEach((handler) => handler.disconnect());
    this.clients = [];
    this.status = 'close';
  }

  private async connect(): Promise<void> {
    this.logger.log('Creating monitor client.');
    if (this.redis instanceof IORedis.Cluster) {
      this.clients = await Promise.all(this.redis.nodes('all').map(this.createMonitor));
    } else {
      this.clients = [await this.createMonitor(this.redis)];
    }
    if (!this.clients.length) {
      throw new ServiceUnavailableException();
    }
    this.status = 'ready';
  }

  private async createMonitor(redis: IORedis.Redis): Promise<IMonitor> {
    this.logger.log('Creating monitor...');
    try {
      const monitor = await redis.monitor() as IMonitor;
      this.logger.log('Succeed to create monitor.');
      return monitor;
    } catch (error) {
      this.logger.error(`Failed to create monitor. ${error.message}.`, JSON.stringify(error));
      return null;
    }
  }
}
