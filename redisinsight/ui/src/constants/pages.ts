import React from 'react'

export interface IRoute {
  path: any;
  component: React.ReactNode;
  pageName?: PageNames;
  exact?: boolean;
  routes?: any;
  protected?: boolean;
  isAvailableWithoutAgreements?: boolean;
}

export enum PageNames {
  workbench = 'workbench',
  browser = 'browser',
  slowLog = 'slowlog',
  pubSub = 'pub-sub',
  analytics = 'analytics',
  clusterDetails = 'cluster-details',
  databaseAnalysis = 'database-analysis',
  settings = 'settings'
}

const redisCloud = '/redis-cloud'
const sentinel = '/sentinel'

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
}
