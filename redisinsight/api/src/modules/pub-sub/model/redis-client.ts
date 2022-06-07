import * as IORedis from 'ioredis';
import { Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RedisClientEvents, RedisClientStatus } from 'src/modules/pub-sub/constants';

export class RedisClient extends EventEmitter2 {
  private logger: Logger = new Logger('RedisClient');

  private client: IORedis.Redis | IORedis.Cluster;

  private readonly databaseId: string;

  private readonly connectFn: () => Promise<IORedis.Redis | IORedis.Cluster>;

  private status: RedisClientStatus;

  constructor(
    databaseId: string,
    connectFn: () => Promise<IORedis.Redis | IORedis.Cluster>,
  ) {
    super();
    this.databaseId = databaseId;
    this.connectFn = connectFn;
  }

  async getClient(): Promise<IORedis.Redis | IORedis.Cluster> {
    try {
      this.logger.debug(`Get client ${this}`);
      switch (this.status) {
        case RedisClientStatus.Connected:
          return this.client;
        case RedisClientStatus.Connecting:
          // wait until connect or error
          break;
        case RedisClientStatus.Error:
        case RedisClientStatus.End:
        default:
          await this.connect();
          return this.client;
      }

      return new Promise((resolve, reject) => {
        this.once(RedisClientEvents.Connected, resolve);
        this.once(RedisClientEvents.ConnectionError, reject);
      });
    } catch (e) {
      this.logger.error('Unable to connect to Redis', e);
      this.status = RedisClientStatus.Error;
      this.emit(RedisClientEvents.ConnectionError, e);
      throw e;
    }
  }

  private async connect() {
    this.status = RedisClientStatus.Connecting;
    this.client = await this.connectFn();
    this.status = RedisClientStatus.Connected;
    this.emit(RedisClientEvents.Connected, this.client);

    this.client.on('message', (channel: string, message: string) => {
      this.emit(RedisClientEvents.Message, `s:${channel}`, {
        channel,
        message,
        time: Date.now(),
      });
    });

    this.client.on('pmessage', (pattern: string, channel: string, message: string) => {
      this.emit(RedisClientEvents.Message, `p:${pattern}`, {
        channel,
        message,
        time: Date.now(),
      });
    });

    this.client.on('end', () => {
      this.status = RedisClientStatus.End;
      this.emit(RedisClientEvents.End);
    });
  }

  destroy() {
    this.client?.removeAllListeners();
    this.client?.disconnect();
    this.client = null;
    this.status = RedisClientStatus.End;
  }

  toString() {
    return `RedisClient:${JSON.stringify({
      databaseId: this.databaseId,
      status: this.status,
      clientStatus: this.client?.status,
    })}`;
  }
}
