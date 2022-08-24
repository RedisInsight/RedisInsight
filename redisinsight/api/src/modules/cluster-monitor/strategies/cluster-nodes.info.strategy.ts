import { AbstractInfoStrategy } from 'src/modules/cluster-monitor/strategies/abstract.info.strategy';
import IORedis from 'ioredis';
import { ClusterNodeDetails, HealthStatus, NodeRole } from 'src/modules/cluster-monitor/models';

export class ClusterNodesInfoStrategy extends AbstractInfoStrategy {
  async getClusterNodesFromRedis(client: IORedis.Cluster): Promise<Partial<ClusterNodeDetails>[]> {
    // @ts-ignore
    const resp: string = await client.sendCommand(new IORedis.Command('cluster', ['nodes'], {
      replyEncoding: 'utf8',
    }));

    return resp.split('\n').filter((e) => e).map((nodeString) => {
      const [id, endpoint, flags, primary,,,,, ...slots] = nodeString.split(' ');
      const [host, ports] = endpoint.split(':');
      const [port] = ports.split('@');
      return {
        id,
        host,
        port: parseInt(port, 10),
        role: primary && primary !== '-' ? NodeRole.Replica : NodeRole.Primary,
        primary: primary && primary !== '-' ? primary : undefined,
        slots: slots?.length ? slots : undefined,
        health: ClusterNodesInfoStrategy.determineNodeHealth(flags),
      };
    })
      .filter((node) => node.role === NodeRole.Primary); // tmp work with primary nodes only;
  }

  static determineNodeHealth(flags: string): HealthStatus {
    if (['fail'].includes(flags)) {
      return HealthStatus.Offline;
    }

    if (['master', 'slave'].includes(flags)) {
      return HealthStatus.Online;
    }

    return HealthStatus.Loading;
  }
}
