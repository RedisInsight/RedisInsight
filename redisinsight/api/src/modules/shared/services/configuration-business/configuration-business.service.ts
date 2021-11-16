import { Injectable } from '@nestjs/common';
import IORedis from 'ioredis';
import {
  filter,
  get,
  isNil,
  map,
} from 'lodash';
import {
  convertBulkStringsToObject,
  convertRedisInfoReplyToObject,
  convertStringsArrayToObject,
  parseClusterNodes,
  calculateRedisHitRatio, convertIntToSemanticVersion,
} from 'src/utils';
import { IRedisModule, IRedisClusterInfo, IRedisClusterNode } from 'src/models';
import {
  pluginUnsupportedCommands,
  pluginBlockingCommands,
  REDIS_MODULES_COMMANDS,
  SUPPORTED_REDIS_MODULES,
} from 'src/constants';
import { RedisDatabaseInfoResponse } from 'src/modules/instances/dto/redis-info.dto';
import { RedisModuleDto } from 'src/modules/instances/dto/database-instance.dto';

@Injectable()
export class ConfigurationBusinessService {
  public async checkClusterConnection(client: IORedis.Redis): Promise<boolean> {
    try {
      const reply = await client.send_command('cluster', ['info']);
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
      await client.send_command('sentinel', ['masters']);
      return true;
    } catch (e) {
      return false;
    }
  }

  public async getRedisClusterNodes(
    client: IORedis.Redis,
  ): Promise<IRedisClusterNode[]> {
    const nodes: any = await client.send_command('cluster', ['nodes']);
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
      const reply = await client.send_command('config', ['get', 'databases']);
      return reply.length ? parseInt(reply[1], 10) : 1;
    } catch (e) {
      return 1;
    }
  }

  public async getLoadedModulesList(client: any): Promise<RedisModuleDto[]> {
    try {
      const reply = await client.send_command('module', ['list']);
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
      await client.send_command('info'),
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
        let commandsInfo = await client.send_command('command', ['info', ...commands]);
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

  /**
   * Get whitelisted commands available for plugins for particular database
   */
  async getPluginWhiteListCommands(client: any): Promise<string[]> {
    let pluginWhiteListCommands = [];
    try {
      const availableCommands = await client.send_command('command');
      const readOnlyCommands = map(filter(availableCommands, (
        command,
      ) => get(command, [2], [])
        .includes('readonly')), (command) => command[0]);

      const blackListCommands = [...pluginUnsupportedCommands, ...pluginBlockingCommands];
      try {
        const dangerousCommands = await client.send_command('acl', ['cat', 'dangerous']);
        blackListCommands.push(...dangerousCommands);
      } catch (e) {
        // ignore error as acl cat available since Redis 6.0
      }

      try {
        const blockingCommands = await client.send_command('acl', ['cat', 'blocking']);
        blackListCommands.push(...blockingCommands);
      } catch (e) {
        // ignore error as acl cat available since Redis 6.0
      }

      pluginWhiteListCommands = filter(readOnlyCommands, (command) => !blackListCommands.includes(command));
    } catch (e) {
      // ignore any error to not block main process of client creation
    }

    return pluginWhiteListCommands;
  }
}
