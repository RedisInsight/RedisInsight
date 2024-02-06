export interface IRoute {
  path: any
  component: (routes: any) => JSX.Element | Element | null
  pageName?: PageNames
  exact?: boolean
  routes?: any
  protected?: boolean
  isAvailableWithoutAgreements?: boolean
}

export enum PageNames {
  workbench = 'workbench',
  browser = 'browser',
  slowLog = 'slowlog',
  pubSub = 'pub-sub',
  analytics = 'analytics',
  clusterDetails = 'cluster-details',
  databaseAnalysis = 'database-analysis',
  settings = 'settings',
  triggeredFunctions = 'triggered-functions',
  triggeredFunctionsLibraries = 'libraries',
  triggeredFunctionsFunctions = 'functions',
  // rdi pages
  rdiPipelineManagement = 'pipeline',
  rdiPipelinePrepare = 'prepare',
  rdiPipelineConfig = 'config',
  rdiPipelineJobs = 'jobs',
}

const redisCloud = '/redis-cloud'
const sentinel = '/sentinel'
const rdi = '/integrate'

export type PageValues = typeof Pages[keyof typeof Pages]
export const Pages = {
  home: '/',
  homeEditInstance: (instanceId: string) => `/?editInstance=${instanceId}`,
  redisEnterpriseAutodiscovery: '/redis-enterprise-autodiscovery',
  settings: `/${PageNames.settings}`,
  redisCloud,
  redisCloudSubscriptions: `${redisCloud}/subscriptions`,
  redisCloudDatabases: `${redisCloud}/databases`,
  redisCloudDatabasesResult: `${redisCloud}/databases-result`,
  sentinel,
  sentinelDatabases: `${sentinel}/databases`,
  sentinelDatabasesResult: `${sentinel}/databases-result`,
  browser: (instanceId: string) => `/${instanceId}/${PageNames.browser}`,
  workbench: (instanceId: string) => `/${instanceId}/${PageNames.workbench}`,
  pubSub: (instanceId: string) => `/${instanceId}/${PageNames.pubSub}`,
  analytics: (instanceId: string) => `/${instanceId}/${PageNames.analytics}`,
  slowLog: (instanceId: string) => `/${instanceId}/${PageNames.analytics}/${PageNames.slowLog}`,
  clusterDetails: (instanceId: string) => `/${instanceId}/${PageNames.analytics}/${PageNames.clusterDetails}`,
  databaseAnalysis: (instanceId: string) => `/${instanceId}/${PageNames.analytics}/${PageNames.databaseAnalysis}`,
  triggeredFunctions: (instanceId: string) => `/${instanceId}/${PageNames.triggeredFunctions}`,
  triggeredFunctionsLibraries: (instanceId: string) =>
    `/${instanceId}/${PageNames.triggeredFunctions}/${PageNames.triggeredFunctionsLibraries}`,
  triggeredFunctionsFunctions: (instanceId: string) =>
    `/${instanceId}/${PageNames.triggeredFunctions}/${PageNames.triggeredFunctionsFunctions}`,
  // rdi pages
  rdi,
  rdiPipeline: (rdiInstance: string) => `${rdi}/${rdiInstance}/${PageNames.rdiPipelineManagement}`,
  rdiPipelineConfig: (rdiInstance: string) =>
    `${rdi}/${rdiInstance}/${PageNames.rdiPipelineManagement}/${PageNames.rdiPipelineConfig}`,
  rdiPipelinePrepare: (rdiInstance: string) =>
    `${rdi}/${rdiInstance}/${PageNames.rdiPipelineManagement}/${PageNames.rdiPipelinePrepare}`,
  rdiPipelineJobs: (rdiInstance: string, jobName: string) =>
    `${rdi}/${rdiInstance}/pipeline/${PageNames.rdiPipelineJobs}/${jobName}`,
}
