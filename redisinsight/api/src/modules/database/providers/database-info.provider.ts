import { Injectable } from '@nestjs/common';
import {
  calculateRedisHitRatio,
  catchAclError,
  convertIntToSemanticVersion,
  convertRedisInfoReplyToObject,
} from 'src/utils';
import { AdditionalRedisModule } from 'src/modules/database/models/additional.redis.module';
import { REDIS_MODULES_COMMANDS, SUPPORTED_REDIS_MODULES } from 'src/constants';
import { get, isNil } from 'lodash';
import { RedisDatabaseInfoResponse } from 'src/modules/database/dto/redis-info.dto';
import { FeatureService } from 'src/modules/feature/feature.service';
import { KnownFeatures } from 'src/modules/feature/constants';
import { convertArrayReplyToObject, convertMultilineReplyToObject } from 'src/modules/redis/utils';
import { RedisClient, RedisClientConnectionType } from 'src/modules/redis/client';

@Injectable()
export class DatabaseInfoProvider {
  constructor(
    private readonly featureService: FeatureService,
  ) {}

  public async filterRawModules(modules: any[]): Promise<any[]> {
    let filteredModules = modules;

    try {
      const filterModules = await this.featureService.getByName(KnownFeatures.RedisModuleFilter);

      if (filterModules?.flag && filterModules.data?.hideByName?.length) {
        filteredModules = modules.filter(({ name }) => {
          const match = filterModules.data.hideByName.find((filter) => filter.expression
            && (new RegExp(filter.expression, filter.options)).test(name));

          return !match;
        });
      }
    } catch (e) {
      // ignore
    }

    return filteredModules;
  }

  /**
   * Determine database modules using "module list" command
   * In case when "module" command is not available use "command info" approach
   * @param client
   */
  public async determineDatabaseModules(client: RedisClient): Promise<AdditionalRedisModule[]> {
    try {
      const reply = await client.call(
        ['module', 'list'],
        { replyEncoding: 'utf8' },
      ) as string[][];
      const modules = await this.filterRawModules(
        reply.map((module: any[]) => convertArrayReplyToObject(module)),
      );

      return modules.map(({ name, ver }) => ({
        name: SUPPORTED_REDIS_MODULES[name] ?? name,
        version: ver,
        semanticVersion: SUPPORTED_REDIS_MODULES[name]
          ? convertIntToSemanticVersion(ver)
          : undefined,
      }));
    } catch (e) {
      return this.determineDatabaseModulesUsingInfo(client);
    }
  }

  /**
   * Determine database server version using "module list" command
   * @param client
   */
  public async determineDatabaseServer(client: RedisClient): Promise<string> {
    try {
      const reply = convertRedisInfoReplyToObject(await client.call(
        ['info', 'server'],
        { replyEncoding: 'utf8' },
      ) as string);
      return reply['server']?.redis_version;
    } catch (e) {
      // continue regardless of error
    }
    return null;
  }

  /**
   * Determine database modules by using "command info" command for each listed (known/supported) module
   * @param client
   * @private
   */
  public async determineDatabaseModulesUsingInfo(client: RedisClient): Promise<AdditionalRedisModule[]> {
    const modules: AdditionalRedisModule[] = [];
    await Promise.all(Array.from(REDIS_MODULES_COMMANDS, async ([moduleName, commands]) => {
      try {
        let commandsInfo = await client.call(
          ['command', 'info', ...commands],
          { replyEncoding: 'utf8' },
        ) as string[];
        commandsInfo = commandsInfo.filter((info) => !isNil(info));
        if (commandsInfo.length) {
          modules.push({ name: moduleName });
        }
      } catch (e) {
        // continue regardless of error
      }
    }));

    return await this.filterRawModules(modules);
  }

  public async getRedisGeneralInfo(
    client: RedisClient,
  ): Promise<RedisDatabaseInfoResponse> {
    if (client.getConnectionType() === RedisClientConnectionType.CLUSTER) {
      return this.getRedisMasterNodesGeneralInfo(client);
    }
    return this.getRedisNodeGeneralInfo(client);
  }

  private async getRedisNodeGeneralInfo(
    client: RedisClient,
  ): Promise<RedisDatabaseInfoResponse> {
    try {
      const info = convertRedisInfoReplyToObject(await client.sendCommand(
        ['info'],
        { replyEncoding: 'utf8' },
      ) as string);
      const serverInfo = info['server'];
      const memoryInfo = info['memory'];
      const keyspaceInfo = info['keyspace'];
      const clientsInfo = info['clients'];
      const statsInfo = info['stats'];
      const replicationInfo = info['replication'];
      const databases = await this.getDatabasesCount(client, keyspaceInfo);
      return {
        version: serverInfo?.redis_version,
        databases,
        role: get(replicationInfo, 'role') || undefined,
        totalKeys: this.getRedisNodeTotalKeysCount(keyspaceInfo),
        usedMemory: parseInt(get(memoryInfo, 'used_memory'), 10) || undefined,
        connectedClients:
          parseInt(get(clientsInfo, 'connected_clients'), 10) || undefined,
        uptimeInSeconds:
          parseInt(get(serverInfo, 'uptime_in_seconds'), 10) || undefined,
        hitRatio: this.getRedisHitRatio(statsInfo),
        cashedScripts: parseInt(get(memoryInfo, 'number_of_cached_scripts'), 10) || undefined,
        server: serverInfo,
      };
    } catch (error) {
      throw catchAclError(error);
    }
  }

  private async getRedisMasterNodesGeneralInfo(
    client: RedisClient,
  ): Promise<RedisDatabaseInfoResponse> {
    const nodesResult: RedisDatabaseInfoResponse[] = await Promise.all(
      (await client.nodes()).map(async (node) => this.getRedisNodeGeneralInfo(node)),
    );
    return nodesResult.reduce((prev, cur) => ({
      version: cur.version,
      usedMemory: prev.usedMemory + cur.usedMemory,
      totalKeys: prev.totalKeys + cur.totalKeys,
      nodes: prev?.nodes ? [...prev.nodes, cur] : [prev, cur],
    }));
  }

  public async getDatabasesCount(client: RedisClient, keyspaceInfo?: object): Promise<number> {
    try {
      const reply = await client.call(
        ['config', 'get', 'databases'],
        { replyEncoding: 'utf8' },
      ) as string;
      return reply.length ? parseInt(reply[1], 10) : 1;
    } catch (e) {
      return this.getDatabaseCountFromKeyspace(keyspaceInfo);
    }
  }

  public async getClientListInfo(client: RedisClient): Promise<any[]> {
    try {
      const clientListResponse = await client.call(
        ['client', 'list'],
        { replyEncoding: 'utf8' },
      ) as string;

      return clientListResponse
        .split(/\r?\n/)
        .filter(Boolean)
        .map((r) => convertMultilineReplyToObject(r, ' ', '='));
    } catch (error) {
      throw catchAclError(error);
    }
  }

  /**
   * Try to determine number of logical database from the `info keyspace`
   *
   * Note: This is unreliable method which may return less logical databases count that database has
   * However this is needed for workaround when `config` command is disabled to understand if we need
   * to show logical database switcher on UI
   * @param keyspaceInfo
   * @private
   */
  private getDatabaseCountFromKeyspace(keyspaceInfo: object): number {
    try {
      const keySpaces = Object.keys(keyspaceInfo);
      const matches = keySpaces[keySpaces.length - 1].match(/(\d+)/);

      return matches[0] ? parseInt(matches[0], 10) + 1 : 1;
    } catch (e) {
      return 1;
    }
  }

  private getRedisNodeTotalKeysCount(keyspaceInfo: object): number {
    try {
      return Object.values(keyspaceInfo).reduce<number>(
        (prev: number, cur: string) => {
          const { keys } = convertMultilineReplyToObject(cur, ',', '=');
          return prev + parseInt(keys, 10);
        },
        0,
      );
    } catch (error) {
      return undefined;
    }
  }

  private getRedisHitRatio(statsInfo: object): number {
    try {
      const keyspaceHits = get(statsInfo, 'keyspace_hits');
      const keyspaceMisses = get(statsInfo, 'keyspace_misses');
      return calculateRedisHitRatio(keyspaceHits, keyspaceMisses);
    } catch (error) {
      return undefined;
    }
  }
}
