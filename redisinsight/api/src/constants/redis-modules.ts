export enum RedisModules {
  RedisAI = 'ai',
  RedisGraph = 'graph',
  RedisGears = 'rg',
  RedisBloom = 'bf',
  RedisJSON = 'ReJSON',
  RediSearch = 'search',
  RedisTimeSeries = 'timeseries',
}

export const SUPPORTED_REDIS_MODULES = Object.freeze({
  ai: RedisModules.RedisAI,
  graph: RedisModules.RedisGraph,
  rg: RedisModules.RedisGears,
  bf: RedisModules.RedisBloom,
  ReJSON: RedisModules.RedisJSON,
  search: RedisModules.RediSearch,
  timeseries: RedisModules.RedisTimeSeries,
});

export const RE_CLOUD_MODULES_NAMES = Object.freeze({
  RedisAI: RedisModules.RedisAI,
  RedisGraph: RedisModules.RedisGraph,
  RedisGears: RedisModules.RedisGears,
  RedisBloom: RedisModules.RedisBloom,
  RedisJSON: RedisModules.RedisJSON,
  RediSearch: RedisModules.RediSearch,
  RedisTimeSeries: RedisModules.RedisTimeSeries,
});

export const RE_CLUSTER_MODULES_NAMES = Object.freeze({
  ai: RedisModules.RedisAI,
  graph: RedisModules.RedisGraph,
  gears: RedisModules.RedisGears,
  bf: RedisModules.RedisBloom,
  ReJSON: RedisModules.RedisJSON,
  search: RedisModules.RediSearch,
  timeseries: RedisModules.RedisTimeSeries,
});

export const REDIS_MODULES_COMMANDS = new Map([
  [RedisModules.RedisAI, ['ai.info']],
  [RedisModules.RedisGraph, ['graph.delete']],
  [RedisModules.RedisGears, ['rg.pyexecute']],
  [RedisModules.RedisBloom, ['bf.info', 'cf.info', 'cms.info', 'topk.info']],
  [RedisModules.RedisJSON, ['json.get']],
  [RedisModules.RediSearch, ['ft.info']],
  [RedisModules.RedisTimeSeries, ['ts.mrange', 'ts.info']],
]);
