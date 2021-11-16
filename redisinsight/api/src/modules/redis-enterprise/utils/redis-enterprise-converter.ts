import { RE_CLUSTER_MODULES_NAMES, RedisModules } from 'src/constants';

export function convertREClusterModuleName(name: string): RedisModules {
  return RE_CLUSTER_MODULES_NAMES[name] ?? name;
}
