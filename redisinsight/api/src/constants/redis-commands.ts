export const pluginUnsupportedCommands = [
  'role',
  'slowlog',
  'failover',
  'bgrewriteaof',
  'psync',
  'shutdown',
  'lastsave',
  'bgsave',
  'restore',
  'cluster',
  'save',
  'debug',
  'pfselftest',
  'flushdb',
  'monitor',
  'pfdebug',
  'sync',
  'slaveof',
  'flushall',
  'migrate',
  'info',
  'keys',
  'replconf',
  'config',
  'replicaof',
  'acl',
  'client',
  'sort',
  'latency',
  'restore-asking',
  'module',
  'swapdb',
];

export const pluginBlockingCommands = [
  'xreadgroup',
  'bzpopmax',
  'blmove',
  'blpop',
  'bzpopmin',
  'brpoplpush',
  'xread',
  'brpop',
];
