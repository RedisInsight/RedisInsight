import IORedis from 'ioredis';
import { chunk } from 'lodash';
import { AbstractInfoStrategy } from 'src/modules/cluster-monitor/strategies/abstract.info.strategy';
import { convertStringsArrayToObject } from 'src/utils';
import { ClusterNodeDetails, NodeRole } from 'src/modules/cluster-monitor/dto';

export class ClusterShardsInfoStrategy extends AbstractInfoStrategy {
  async getClusterNodesFromRedis(client: IORedis.Cluster) {
    // @ts-ignore
    const resp: any[] = await client.sendCommand(new IORedis.Command('cluster', ['shards'], {
      replyEncoding: 'utf8',
    }));

    return [].concat(...resp.map((shardArray) => {
      const shard = convertStringsArrayToObject(shardArray);
      const slots = ClusterShardsInfoStrategy.calculateSlots(shard.slots);
      return ClusterShardsInfoStrategy.processShardNodes(shard.nodes, slots);
    }));
  }

  static calculateSlots(slots: number[]): string[] {
    return chunk(slots, 2).map(([slot1, slot2]) => {
      if (slot1 === slot2) {
        return `${slot1}`;
      }

      return `${slot1}-${slot2}`;
    });
  }

  static processShardNodes(shardNodes: any[], slots: string[]): Partial<ClusterNodeDetails>[] {
    let primary;
    const nodes = shardNodes.map((nodeArray) => {
      const nodeObj = convertStringsArrayToObject(nodeArray);
      const node = {
        id: nodeObj.id,
        host: nodeObj.ip,
        port: nodeObj.port,
        role: nodeObj.role === 'master' ? NodeRole.Primary : NodeRole.Replica,
        replicationOffset: nodeObj['replication-offset'],
        health: nodeObj.health,
      };

      if (node.role === 'primary') {
        primary = node.id;
        node['slots'] = slots;
      }

      return node;
    });

    return nodes.map((node) => {
      if (node.role !== NodeRole.Primary) {
        return {
          ...node,
          primary,
        };
      }

      return node;
    });
  }
}
