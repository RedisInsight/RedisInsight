import IORedis from 'ioredis';
import { ClusterDetails } from 'src/modules/cluster-monitor/dto';

export interface IClusterInfo {
  getClusterDetails(client: IORedis.Cluster): Promise<ClusterDetails>;
}
