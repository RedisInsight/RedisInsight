export enum RdiUrl {
  GetSchema = '/api/v1/schemas',
  GetPipeline = '/api/v1/pipelines',
  GetStrategies = 'api/v1/pipelines/strategies',
  GetTemplate = 'deployments/templates',
  DryRunJob = '/api/v1/pipelines/jobs/dry-run',
  Deploy = 'api/v1/pipelines',
  TestConnections = 'api/v1/pipelines/targets/dry-run',
  GetStatistics = '/api/v1/monitoring/statistics',
  GetPipelineStatus = 'api/v1/status',
}
