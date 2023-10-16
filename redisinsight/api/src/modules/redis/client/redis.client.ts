import { ClientMetadata } from 'src/common/models';
import { isNumber } from 'lodash';
import { RedisString } from 'src/common/constants';
import apiConfig from 'src/utils/config';

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

export type RedisClientCommandArgument = RedisString | number;
export type RedisClientCommandArguments = RedisClientCommandArgument[];
export type RedisClientCommand = [cmd: string, ...args: RedisClientCommandArguments];
export type RedisClientCommandReply = string | number | Buffer | null | undefined | Array<RedisClientCommandReply>;

export abstract class RedisClient {
  public readonly id: string;

  protected lastTimeUsed: number;

  constructor(
    protected readonly clientMetadata: ClientMetadata,
    protected readonly client: any,
  ) {
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

  abstract call(command: RedisClientCommand, options?: IRedisClientCommandOptions): Promise<RedisClientCommandReply>;

  abstract sendPipeline(
    commands: RedisClientCommand[],
    options?: IRedisClientCommandOptions,
  ): Promise<Array<[Error | null, RedisClientCommandReply]>>;

  /**
   * Close Redis connection without waiting for pending commands
   */
  abstract disconnect(): Promise<void>;

  /**
   * Wait for pending commands will be processed and then close the connection
   */
  abstract quit(): Promise<void>;

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
