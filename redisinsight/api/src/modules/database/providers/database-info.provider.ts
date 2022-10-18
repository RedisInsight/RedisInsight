import { Injectable } from '@nestjs/common';
import * as IORedis from 'ioredis';
import {
  IRedisClusterInfo,
  IRedisClusterNodeAddress,
  RedisClusterNodeLinkState,
} from 'src/models';
import {
  convertBulkStringsToObject,
  convertIntToSemanticVersion,
  convertStringsArrayToObject,
  parseClusterNodes,
} from 'src/utils';
import { RedisModuleDto } from 'src/modules/instances/dto/database-instance.dto';
import { REDIS_MODULES_COMMANDS, SUPPORTED_REDIS_MODULES } from 'src/constants';
import { isNil } from 'lodash';

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
  public async determineDatabaseModules(client: any): Promise<RedisModuleDto[]> {
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
  public async determineDatabaseModulesUsingInfo(client: any): Promise<RedisModuleDto[]> {
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
