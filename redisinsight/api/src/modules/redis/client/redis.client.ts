import { ClientContext, ClientMetadata } from 'src/common/models';
import { isNumber } from 'lodash';
import { RedisString } from 'src/common/constants';
import apiConfig from 'src/utils/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { convertArrayOfKeyValuePairsToObject, convertRedisInfoReplyToObject } from 'src/utils';
import * as semverCompare from 'node-version-compare';
import { RedisDatabaseHelloResponse } from 'src/modules/database/dto/redis-info.dto';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { plainToClass } from 'class-transformer';

const REDIS_CLIENTS_CONFIG = apiConfig.get('redis_clients');

export enum RedisClientConnectionType {
  STANDALONE = 'STANDALONE',
  CLUSTER = 'CLUSTER',
  SENTINEL = 'SENTINEL',
}

export enum RedisClientNodeRole {
  PRIMARY = 'PRIMARY',
  SECONDARY = 'SECONDARY',
}

export interface IRedisClientCommandOptions {
  firstKey?: RedisString,
  readOnly?: boolean,
  replyEncoding?: 'utf8' | null,
  unknownCommands?: boolean,
}

export interface IRedisClientOptions {
  host?: string,
  port?: number,
  natHost?: string,
  natPort?: number,
  tlsPort?: number,
  connectTimeout?: number,
}

export type RedisClientCommandArgument = RedisString | number;
export type RedisClientCommandArguments = RedisClientCommandArgument[];
export type RedisClientCommand = [cmd: string, ...args: RedisClientCommandArguments];
export type RedisClientCommandReply = string | number | Buffer | null | undefined | Array<RedisClientCommandReply>;

export enum RedisFeature {
  HashFieldsExpiration = 'HashFieldsExpiration',
}

export abstract class RedisClient extends EventEmitter2 {
  public readonly id: string;

  protected info: any;

  protected lastTimeUsed: number;

  constructor(
    public readonly clientMetadata: ClientMetadata,
    protected readonly client: unknown,
    public readonly options: IRedisClientOptions,
  ) {
    super();
    this.clientMetadata = RedisClient.prepareClientMetadata(clientMetadata);
    this.lastTimeUsed = Date.now();
    this.id = RedisClient.generateId(this.clientMetadata);
  }

  /**
   * Get native client
   * @deprecated
   * For backward compatibility. Will be deleted with next releases
   */
  public getClient(): any {
    return this.client;
  }

  public setLastUsed(): void {
    this.lastTimeUsed = Date.now();
  }

  public isIdle(): boolean {
    return Date.now() - this.lastTimeUsed > REDIS_CLIENTS_CONFIG.idleThreshold;
  }

  /**
   * Checks if client has established connection
   */
  abstract isConnected(): boolean;

  /**
   * Get connection type (STANDALONE, CLUSTER or SENTINEL)
   */
  abstract getConnectionType(): RedisClientConnectionType;

  abstract nodes(role?: RedisClientNodeRole): Promise<RedisClient[]>;

  abstract sendCommand(
    command: RedisClientCommand,
    options?: IRedisClientCommandOptions,
  ): Promise<RedisClientCommandReply>;

  abstract sendPipeline(
    commands: RedisClientCommand[],
    options?: IRedisClientCommandOptions,
  ): Promise<Array<[Error | null, RedisClientCommandReply]>>;

  /** TODO: It's necessary to investigate transactions
  abstract sendMulti(
    commands: RedisClientCommand[],
    options?: IRedisClientCommandOptions,
  ): Promise<Array<[Error | null, RedisClientCommandReply]>>;
   */

  abstract call(command: RedisClientCommand, options?: IRedisClientCommandOptions): Promise<RedisClientCommandReply>;

  abstract monitor(): Promise<any>;

  /**
   * Close Redis connection without waiting for pending commands
   */
  abstract disconnect(): Promise<void>;

  /**
   * Wait for pending commands will be processed and then close the connection
   */
  abstract quit(): Promise<void>;

  abstract publish(channel: string, message: string): Promise<number>;

  abstract subscribe(channel: string): Promise<void>;

  abstract pSubscribe(channel: string): Promise<void>;

  abstract unsubscribe(channel: string): Promise<void>;

  abstract pUnsubscribe(channel: string): Promise<void>;

  abstract getCurrentDbIndex(): Promise<number>;

  /**
   * Detects if feature is supported by redis database
   * todo: move out from here when final requirements will be clear
   * @param feature
   */
  public async isFeatureSupported(feature: RedisFeature): Promise<boolean> {
    switch (feature) {
      case RedisFeature.HashFieldsExpiration:
        try {
          const info = await this.getInfo(false);
          return info?.['server']?.['redis_version'] && semverCompare('7.3', info['server']['redis_version']) < 1;
        } catch (e) {
          return false;
        }
      default:
        return false;
    }
  }

  /**
   * Get redis database info
   * Uses cache by default
   * @param force
   * @param infoSection - e.g. server, clients, memory, etc.
   */
  public async getInfo(force = true, infoSection?: string) {
    if (force || !this.info) {
      try {
        const infoData = convertRedisInfoReplyToObject(await this.call(
          infoSection ? ['info', infoSection] : ['info'],
          { replyEncoding: 'utf8' },
        ) as string);

        this.info = {
          ...this.info,
          ...infoData,
        }
      } catch (error) {
        if (error.message.includes(ERROR_MESSAGES.NO_INFO_COMMAND_PERMISSION)) {
          try {
            // Fallback to getting basic information from `hello` command
            this.info = await this.getRedisHelloInfo();
          } catch (_error) {
            this.info = {};
          }
        } else {
          this.info = {};
        }
      }
    }

    return this.info;
  }

  private async getRedisHelloInfo() {
    const helloResponse = await this.getRedisHelloResponse();

    return {
      replication: {
        role: helloResponse.role,
      },
      server: {
        server_name: helloResponse.server,
        redis_version: helloResponse.version,
        redis_mode: helloResponse.mode,
      },
      modules: helloResponse.modules,
    };
  }

  private async getRedisHelloResponse(): Promise<RedisDatabaseHelloResponse> {
    const helloResponse = (await this.sendCommand(['hello'], {
      replyEncoding: 'utf8',
    })) as any[];

    const helloInfoResponse = convertArrayOfKeyValuePairsToObject(helloResponse);

    if (helloInfoResponse.modules?.length) {
      helloInfoResponse.modules = helloInfoResponse.modules.map(convertArrayOfKeyValuePairsToObject);
    }

    return plainToClass(RedisDatabaseHelloResponse, helloInfoResponse);
  }

  /**
   * Prepare clientMetadata to be used for generating id and other operations with clients
   * like: find, remove many, etc.
   * @param clientMetadata
   */
  static prepareClientMetadata(clientMetadata: ClientMetadata): ClientMetadata {
    return {
      ...clientMetadata,
      // Workaround: for cli connections we must ignore db index when storing/getting client
      // since inside CLI itself users are able to "select" database manually
      // uniqueness will be guaranteed by ClientMetadata.uniqueId and each opened CLI terminal
      // will have own and a single client
      db: clientMetadata.context === ClientContext.CLI ? null : clientMetadata.db,
    };
  }

  static generateId(cm: ClientMetadata): string {
    const empty = '(nil)';
    const separator = '_';

    const id = [
      cm.databaseId,
      cm.context,
      cm.uniqueId || empty,
      isNumber(cm.db) ? cm.db : empty,
    ].join(separator);

    const uId = [
      cm.sessionMetadata?.userId || empty,
      cm.sessionMetadata?.sessionId || empty,
      cm.sessionMetadata?.uniqueId || empty,
    ].join(separator);

    return [
      id,
      uId,
    ].join(separator);
  }
}
