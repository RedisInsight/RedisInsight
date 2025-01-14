import {
  AdditionalRedisModuleName,
  RE_CLUSTER_MODULES_NAMES,
} from 'src/constants';

export function convertREClusterModuleName(
  name: string,
): AdditionalRedisModuleName {
  return RE_CLUSTER_MODULES_NAMES[name] ?? name;
}
