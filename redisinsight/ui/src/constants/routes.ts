import React from 'react'
import { PageNames, Pages } from 'uiSrc/constants'
import {
  BrowserPage,
  HomePage,
  InstancePage,
  RedisClusterDatabasesPage,
  RedisCloudSubscriptionsPage,
  RedisCloudDatabasesPage,
  SettingsPage,
  RedisCloudPage,
  RedisCloudDatabasesResultPage,
} from 'uiSrc/pages'
import WorkbenchPage from 'uiSrc/pages/workbench'
import SentinelPage from 'uiSrc/pages/sentinel'
import SentinelDatabasesPage from 'uiSrc/pages/sentinelDatabases'
import SentinelDatabasesResultPage from 'uiSrc/pages/sentinelDatabasesResult'

export interface IRoute {
  path: any;
  component: React.ReactNode;
  pageName?: PageNames,
  exact?: boolean;
  routes?: any;
  isAvailableWithoutAgreements?: boolean;
}

export const INSTANCE_ROUTES: IRoute[] = [
  {
    pageName: PageNames.browser,
    path: Pages.browser(':instanceId'),
    component: BrowserPage,
  },
  {
    pageName: PageNames.workbench,
    path: Pages.workbench(':instanceId'),
    component: WorkbenchPage,
  },
]

const ROUTES: IRoute[] = [
  {
    path: Pages.home,
    exact: true,
    component: HomePage,
    isAvailableWithoutAgreements: true,
  },
  {
    path: Pages.redisEnterpriseAutodiscovery,
    component: RedisClusterDatabasesPage,
  },
  {
    path: Pages.settings,
    component: SettingsPage,
  },
  {
    path: Pages.redisCloud,
    component: RedisCloudPage,
    routes: [
      {
        path: Pages.redisCloudSubscriptions,
        component: RedisCloudSubscriptionsPage,
      },
      {
        path: Pages.redisCloudDatabases,
        component: RedisCloudDatabasesPage,
      },
      {
        path: Pages.redisCloudDatabasesResult,
        component: RedisCloudDatabasesResultPage,
      },
    ],
  },
  {
    path: Pages.sentinel,
    component: SentinelPage,
    routes: [
      {
        path: Pages.sentinelDatabases,
        component: SentinelDatabasesPage,
      },
      {
        path: Pages.sentinelDatabasesResult,
        component: SentinelDatabasesResultPage,
      },
    ],
  },
  {
    path: '/:instanceId',
    component: InstancePage,
    routes: INSTANCE_ROUTES,
  },
]

export default ROUTES
