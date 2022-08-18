import { Injectable } from '@nestjs/common';
import * as IORedis from 'ioredis';
import { get, isNil } from 'lodash';
import {
  convertBulkStringsToObject,
  convertRedisInfoReplyToObject,
  convertStringsArrayToObject,
  parseClusterNodes,
  calculateRedisHitRatio, convertIntToSemanticVersion,
} from 'src/utils';
import { IRedisModule, IRedisClusterInfo, IRedisClusterNode } from 'src/models';
import {
  REDIS_MODULES_COMMANDS,
  SUPPORTED_REDIS_MODULES,
} from 'src/constants';
import { RedisDatabaseInfoResponse } from 'src/modules/instances/dto/redis-info.dto';
import { RedisModuleDto } from 'src/modules/instances/dto/database-instance.dto';

@Injectable()
export class ConfigurationBusinessService {
  public async checkClusterConnection(client: IORedis.Redis): Promise<boolean> {
    try {
      const reply = await client.cluster('INFO');
      const clusterInfo: IRedisClusterInfo = convertBulkStringsToObject(reply);
      return clusterInfo?.cluster_state === 'ok';
    } catch (e) {
      return false;
    }
  }

  public async checkSentinelConnection(
    client: IORedis.Redis,
  ): Promise<boolean> {
    try {
      await client.call('sentinel', ['masters']);
      return true;
    } catch (e) {
      return false;
    }
  }

  public async getRedisClusterNodes(
    client: IORedis.Redis,
  ): Promise<IRedisClusterNode[]> {
    const nodes: any = await client.call('cluster', ['nodes']);
    return parseClusterNodes(nodes);
  }

  public async getRedisGeneralInfo(
    client: IORedis.Redis | IORedis.Cluster,
  ): Promise<RedisDatabaseInfoResponse> {
    if (client instanceof IORedis.Cluster) {
      return this.getRedisMasterNodesGeneralInfo(client);
    }
    return this.getRedisNodeGeneralInfo(client);
  }

  public async getDatabasesCount(client: any): Promise<number> {
    try {
      const reply = await client.call('config', ['get', 'databases']);
      return reply.length ? parseInt(reply[1], 10) : 1;
    } catch (e) {
      return 1;
    }
  }

  public async getLoadedModulesList(client: any): Promise<RedisModuleDto[]> {
    try {
      const reply = await client.call('module', ['list']);
      const modules = reply.map((module: any[]) => convertStringsArrayToObject(module));
      return this.convertRedisModules(modules);
    } catch (e) {
      // TODO: detect loaded modules without using ModuleList command
      return this.detectRedisModules(client);
    }
  }

  private async getRedisNodeGeneralInfo(
    client: IORedis.Redis,
  ): Promise<RedisDatabaseInfoResponse> {
    const info = convertRedisInfoReplyToObject(
      await client.info(),
    );
    const serverInfo = info['server'];
    const memoryInfo = info['memory'];
    const keyspaceInfo = info['keyspace'];
    const clientsInfo = info['clients'];
    const statsInfo = info['stats'];
    const replicationInfo = info['replication'];
    const databases = await this.getDatabasesCount(client);
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
      server: serverInfo,
    };
  }

  private async getRedisMasterNodesGeneralInfo(
    client,
  ): Promise<RedisDatabaseInfoResponse> {
    const nodesResult: RedisDatabaseInfoResponse[] = await Promise.all(
      client
        .nodes('all')
        .map(async (node) => this.getRedisNodeGeneralInfo(node)),
    );
    return nodesResult.reduce((prev, cur) => ({
      version: cur.version,
      usedMemory: prev.usedMemory + cur.usedMemory,
      totalKeys: prev.totalKeys + cur.totalKeys,
      nodes: prev?.nodes ? [...prev.nodes, cur] : [prev, cur],
    }));
  }

  private getRedisNodeTotalKeysCount(keyspaceInfo: object): number {
    try {
      return Object.values(keyspaceInfo).reduce<number>(
        (prev: number, cur: string) => {
          const { keys } = convertBulkStringsToObject(cur, ',', '=');
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

  private convertRedisModules(modules: IRedisModule[] = []): RedisModuleDto[] {
    return modules.map((module): RedisModuleDto => {
      const { name, ver } = module;
      return {
        name: SUPPORTED_REDIS_MODULES[name] ?? name,
        version: ver,
        semanticVersion: SUPPORTED_REDIS_MODULES[name]
          ? convertIntToSemanticVersion(ver)
          : undefined,
      };
    });
  }

  private async detectRedisModules(client: any): Promise<RedisModuleDto[]> {
    const modules: RedisModuleDto[] = [];
    await Promise.all(Array.from(REDIS_MODULES_COMMANDS, async ([moduleName, commands]) => {
      try {
        let commandsInfo = await client.call('command', ['info', ...commands]);
        commandsInfo = commandsInfo.filter((info) => !isNil(info));
        if (commandsInfo.length) {
          modules.push({ name: moduleName });
        }
      } catch (e) {
        // continue regardless of error
      }
    }));
    return modules;
  }
}
