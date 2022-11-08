import { cloneDeep } from 'lodash';
import { AdditionalRedisModuleName, SUPPORTED_REDIS_MODULES } from 'src/constants';
import { AdditionalRedisModule } from 'src/modules/database/models/additional.redis.module';

interface IModuleSummary {
  loaded: boolean;
  version?: number;
  semanticVersion?: number;
}
interface IRedisModulesSummary extends Record<keyof typeof AdditionalRedisModuleName, IModuleSummary> {
  customModules: AdditionalRedisModule[]
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

export const getRedisModulesSummary = (modules: AdditionalRedisModule[] = []): IRedisModulesSummary => {
  const summary = cloneDeep(DEFAULT_SUMMARY);
  try {
    modules.forEach(((module) => {
      if (SUPPORTED_REDIS_MODULES[module.name]) {
        const moduleName = getEnumKeyBValue(AdditionalRedisModuleName, module.name);
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
