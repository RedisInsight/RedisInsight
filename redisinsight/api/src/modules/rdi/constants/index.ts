export enum RdiUrl {
  GetSchema = '/schema',
  GetPipeline = '/pipeline',
  GetStrategies = 'pipelines/strategies',
  GetTemplate = 'deployments/templates',
  DryRunJob = '/api/v1/pipelines/jobs/dry-run',
  Deploy = '/deploy',
  TestConnections = '/test-connections',
  GetStatistics = '/statistics',
}
