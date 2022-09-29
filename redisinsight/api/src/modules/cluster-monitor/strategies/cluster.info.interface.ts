import { Cluster } from 'ioredis';
import { ClusterDetails } from 'src/modules/cluster-monitor/models';

export interface IClusterInfo {
  getClusterDetails(client: Cluster): Promise<ClusterDetails>;
}
