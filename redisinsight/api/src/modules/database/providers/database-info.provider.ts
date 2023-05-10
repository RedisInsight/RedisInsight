import { BadRequestException, Injectable } from '@nestjs/common';
import * as IORedis from 'ioredis';
import {
  IRedisClusterInfo,
  IRedisClusterNodeAddress,
  RedisClusterNodeLinkState,
} from 'src/models';
import {
  calculateRedisHitRatio,
  catchAclError,
  convertBulkStringsToObject,
  convertIntToSemanticVersion,
  convertRedisInfoReplyToObject,
  convertStringsArrayToObject,
  parseClusterNodes,
} from 'src/utils';
import { AdditionalRedisModule } from 'src/modules/database/models/additional.redis.module';
import { REDIS_MODULES_COMMANDS, SUPPORTED_REDIS_MODULES } from 'src/constants';
import { get, isNil } from 'lodash';
import { SentinelMaster, SentinelMasterStatus } from 'src/modules/redis-sentinel/models/sentinel-master';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { Endpoint } from 'src/common/models';
import { RedisDatabaseInfoResponse } from 'src/modules/database/dto/redis-info.dto';

@Injectable()
export class DatabaseInfoProvider {
  /**
   * Check weather current database is a cluster
   * @param client
   */
  public async isCluster(client: IORedis.Redis): Promise<boolean> {
    try {
      const reply = await client.cluster('INFO');
      const clusterInfo: IRedisClusterInfo = convertBulkStringsToObject(reply);
      return clusterInfo?.cluster_state === 'ok';
    } catch (e) {
      return false;
    }
  }

  /**
   * Check weather current database is a sentinel
   * @param client
   */
  public async isSentinel(client: IORedis.Redis): Promise<boolean> {
    try {
      await client.call('sentinel', ['masters']);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Determine all cluster nodes for current connection (client)
   * @param client
   */
  public async determineClusterNodes(
    client: IORedis.Redis,
  ): Promise<IRedisClusterNodeAddress[]> {
    const nodes = parseClusterNodes(await client.call('cluster', ['nodes']) as string)
      .filter((node) => node.linkState === RedisClusterNodeLinkState.Connected);

    return nodes.map((node) => ({
      host: node.host,
      port: node.port,
    }));
  }

  /**
   * Determine database modules using "module list" command
   * In case when "module" command is not available use "command info" approach
   * @param client
   */
  public async determineDatabaseModules(client: any): Promise<AdditionalRedisModule[]> {
    try {
      const reply = await client.call('module', ['list']);
      const modules = reply.map((module: any[]) => convertStringsArrayToObject(module));
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
   * Determine database modules by using "command info" command for each listed (known/supported) module
   * @param client
   * @private
   */
  public async determineDatabaseModulesUsingInfo(client: any): Promise<AdditionalRedisModule[]> {
    const modules: AdditionalRedisModule[] = [];
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

  /**
   * Get list of master groups for Sentinel instance using established connection (client)
   * @param client
   */
  public async determineSentinelMasterGroups(client: IORedis.Redis): Promise<SentinelMaster[]> {
    let result: SentinelMaster[];
    try {
      const reply = await client.call('sentinel', ['masters']);
      // @ts-expect-error
      // https://github.com/luin/ioredis/issues/1572
      result = reply.map((item) => {
        const {
          ip,
          port,
          name,
          'num-slaves': numberOfSlaves,
          flags,
        } = convertStringsArrayToObject(item);
        return {
          host: ip,
          port: parseInt(port, 10),
          name,
          status: flags?.includes('down') ? SentinelMasterStatus.Down : SentinelMasterStatus.Active,
          numberOfSlaves: parseInt(numberOfSlaves, 10),
        };
      });
      await Promise.all(
        result.map(async (master: SentinelMaster, index: number) => {
          const nodes = await this.getMasterEndpoints(client, master.name);
          result[index] = {
            ...master,
            nodes,
          };
        }),
      );

      return result;
    } catch (error) {
      if (error.message.includes('unknown command `sentinel`')) {
        throw new BadRequestException(ERROR_MESSAGES.WRONG_DISCOVERY_TOOL());
      }

      throw catchAclError(error);
    }
  }

  /**
   * Get list of Sentinels for particular Sentinel master group
   * @param client
   * @param masterName
   */
  private async getMasterEndpoints(
    client: IORedis.Redis,
    masterName: string,
  ): Promise<Endpoint[]> {
    let result: Endpoint[];
    try {
      const reply = await client.call('sentinel', [
        'sentinels',
        masterName,
      ]);
      // @ts-expect-error
      // https://github.com/luin/ioredis/issues/1572
      result = reply.map((item) => {
        const { ip, port } = convertStringsArrayToObject(item);
        return { host: ip, port: parseInt(port, 10) };
      });

      return [
        { host: client.options.host, port: client.options.port },
        ...result,
      ];
    } catch (error) {
      if (error.message.includes('unknown command `sentinel`')) {
        throw new BadRequestException(ERROR_MESSAGES.WRONG_DATABASE_TYPE);
      }

      throw catchAclError(error);
    }
  }

  public async getRedisGeneralInfo(
    client: IORedis.Redis | IORedis.Cluster,
  ): Promise<RedisDatabaseInfoResponse> {
    if (client.isCluster) {
      return this.getRedisMasterNodesGeneralInfo(client);
    }
    return this.getRedisNodeGeneralInfo(client as IORedis.Redis);
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

  public async getDatabasesCount(client: any, keyspaceInfo?: object): Promise<number> {
    try {
      const reply = await client.call('config', ['get', 'databases']);
      return reply.length ? parseInt(reply[1], 10) : 1;
    } catch (e) {
      return this.getDatabaseCountFromKeyspace(keyspaceInfo);
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
}
