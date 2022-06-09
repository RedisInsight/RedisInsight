import config from 'src/utils/config';

const WORKBENCH_CONFIG = config.get('workbench');

export enum WorkbenchToolUnsupportedCommands {
  Monitor = 'monitor',
  Subscribe = 'subscribe',
  PSubscribe = 'psubscribe',
  SSubscribe = 'ssubscribe',
  Sync = 'sync',
  PSync = 'psync',
  ScriptDebug = 'script debug',
  Select = 'select',
}

export const getUnsupportedCommands = (): string[] => [
  ...Object.values(WorkbenchToolUnsupportedCommands),
  ...WORKBENCH_CONFIG.unsupportedCommands,
];
