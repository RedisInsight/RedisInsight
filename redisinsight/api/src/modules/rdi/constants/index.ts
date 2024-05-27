export enum RdiUrl {
  GetSchema = 'api/v1/schemas',
  GetPipeline = 'api/v1/pipelines',
  GetStrategies = 'api/v1/pipelines/strategies',
  GetTemplate = 'deployments/templates',
  DryRunJob = 'api/v1/pipelines/jobs/dry-run',
  JobFunctions = '/api/v1/pipelines/jobs/functions',
  Deploy = 'api/v1/pipelines',
  TestConnections = 'api/v1/pipelines/targets/dry-run',
  GetStatistics = 'api/v1/monitoring/statistics',
  GetPipelineStatus = 'api/v1/status',
  Login = 'api/v1/login',
  Action = 'api/v1/actions',
}

export const IDLE_TRESHOLD = 10 * 60 * 1000; // 10 min
export const RDI_TIMEOUT = 30_000; // 30 sec
export const TOKEN_TRESHOLD = 2 * 60 * 1000; // 2 min
export const RDI_SYNC_INTERVAL = 5 * 60 * 1_000; // 5 min
export const POLLING_INTERVAL = 1_000;
export const MAX_POLLING_TIME = 2 * 60 * 1000; // 2 min
