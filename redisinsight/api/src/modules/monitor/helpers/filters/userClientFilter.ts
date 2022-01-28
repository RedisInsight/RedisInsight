import { IOnDatePayload } from 'src/modules/monitor/helpers/client-monitor-observer';
import { CONNECTION_NAME_GLOBAL_PREFIX } from 'src/constants';

export type MonitorFilter = (data: IOnDatePayload) => Promise<boolean>;

export const userClientFilter = (): MonitorFilter => async (data: IOnDatePayload) => {
  try {
    const { shardOptions, source, sourceOptions } = data;
    if (!sourceOptions?.connectionName || !shardOptions.connectionName.startsWith(CONNECTION_NAME_GLOBAL_PREFIX)) {
      return false;
    }
    if (shardOptions.clientAddress) {
      const [host] = shardOptions.clientAddress.split(':');
      if (!source.startsWith(host)) return false;
    }
    return true;
  } catch (error) {
    return true;
  }
};
