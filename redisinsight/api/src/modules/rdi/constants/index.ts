export enum RdiUrl {
  GetSchema = '/schema',
  GetPipeline = '/pipeline',
  GetStrategies = 'pipelines/strategies',
  GetTemplate = 'deployments/templates',
  DryRunJob = '/api/v1/pipelines/jobs/dry-run',
  JobFunctions = '/api/v1/pipelines/jobs/functions',
  Deploy = '/deploy',
  TestConnections = '/test-connections',
  GetStatistics = '/statistics',
}
