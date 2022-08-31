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
  clusterDetails = 'cluster-details',
}

const redisCloud = '/redis-cloud'
const sentinel = '/sentinel'

export const Pages = {
  home: '/',
  homeEditInstance: (instanceId: string) => `/?editInstance=${instanceId}`,
  redisEnterpriseAutodiscovery: '/redis-enterprise-autodiscovery',
  settings: '/settings',
  redisCloud,
  redisCloudSubscriptions: `${redisCloud}/subscriptions`,
  redisCloudDatabases: `${redisCloud}/databases`,
  redisCloudDatabasesResult: `${redisCloud}/databases-result`,
  sentinel,
  sentinelDatabases: `${sentinel}/databases`,
  sentinelDatabasesResult: `${sentinel}/databases-result`,
  browser: (instanceId: string) => `/${instanceId}/${PageNames.browser}`,
  workbench: (instanceId: string) => `/${instanceId}/${PageNames.workbench}`,
  slowLog: (instanceId: string) => `/${instanceId}/${PageNames.slowLog}`,
  pubSub: (instanceId: string) => `/${instanceId}/${PageNames.pubSub}`,
  clusterDetails: (instanceId: string) => `/${instanceId}/${PageNames.clusterDetails}`,
}
