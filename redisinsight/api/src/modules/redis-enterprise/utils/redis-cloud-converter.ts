import { RE_CLOUD_MODULES_NAMES } from 'src/constants';

export function convertRECloudModuleName(name: string): string {
  return RE_CLOUD_MODULES_NAMES[name] ?? name;
}
