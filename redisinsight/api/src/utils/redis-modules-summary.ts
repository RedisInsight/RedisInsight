import { cloneDeep } from 'lodash';
import { RedisModules, SUPPORTED_REDIS_MODULES } from 'src/constants';
import { RedisModuleDto } from 'src/modules/instances/dto/database-instance.dto';

interface IModuleSummary {
  loaded: boolean;
  version?: number;
  semanticVersion?: number;
}
interface IRedisModulesSummary extends Record<keyof typeof RedisModules, IModuleSummary> {
  customModules: RedisModuleDto[]
}
export const DEFAULT_SUMMARY: IRedisModulesSummary = Object.freeze(
  {
    RediSearch: { loaded: false },
    RedisAI: { loaded: false },
    RedisGraph: { loaded: false },
    RedisGears: { loaded: false },
    RedisBloom: { loaded: false },
    RedisJSON: { loaded: false },
    RedisTimeSeries: { loaded: false },
    customModules: [],
  },
);

const getEnumKeyBValue = (myEnum: any, enumValue: number | string): string => {
  const keys = Object.keys(myEnum);
  const index = keys.findIndex((x) => myEnum[x] === enumValue);
  return index > -1 ? keys[index] : '';
};

export const getRedisModulesSummary = (modules: RedisModuleDto[] = []): IRedisModulesSummary => {
  const summary = cloneDeep(DEFAULT_SUMMARY);
  try {
    modules.forEach(((module) => {
      if (SUPPORTED_REDIS_MODULES[module.name]) {
        const moduleName = getEnumKeyBValue(RedisModules, module.name);
        summary[moduleName] = {
          loaded: true,
          version: module.version,
          semanticVersion: module.semanticVersion,
        };
      } else {
        summary.customModules.push(module);
      }
    }));
  } catch (e) {
    // continue regardless of error
  }
  return summary;
};
