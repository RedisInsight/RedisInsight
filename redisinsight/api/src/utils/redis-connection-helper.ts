import IORedis from 'ioredis';
import { get } from 'lodash';
import { CONNECTION_NAME_GLOBAL_PREFIX } from 'src/constants';

export const generateRedisConnectionName = (namespace: string, id: string, separator = '-') => {
  try {
    return [CONNECTION_NAME_GLOBAL_PREFIX, namespace, id?.substr(0, 8)].join(separator).toLowerCase();
  } catch (e) {
    return CONNECTION_NAME_GLOBAL_PREFIX;
  }
};

export const getConnectionName = (client: IORedis.Redis | IORedis.Cluster) => {
  try {
    if (client instanceof IORedis.Cluster) {
      return get(client, 'options.redisOptions.connectionName', CONNECTION_NAME_GLOBAL_PREFIX);
    }
    return get(client, 'options.connectionName', CONNECTION_NAME_GLOBAL_PREFIX);
  } catch (e) {
    return CONNECTION_NAME_GLOBAL_PREFIX;
  }
};
