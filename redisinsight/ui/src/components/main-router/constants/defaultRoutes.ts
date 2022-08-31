import { IRoute, PageNames, Pages } from 'uiSrc/constants'
import {
  BrowserPage,
  HomePage,
  InstancePage,
  RedisCloudDatabasesPage,
  RedisCloudDatabasesResultPage,
  RedisCloudPage,
  RedisCloudSubscriptionsPage,
  RedisClusterDatabasesPage,
} from 'uiSrc/pages'
import WorkbenchPage from 'uiSrc/pages/workbench'
import SlowLogPage from 'uiSrc/pages/slowLog'
import PubSubPage from 'uiSrc/pages/pubSub'
import ClusterDetailsPage from 'uiSrc/pages/clusterDetails'
import AnalyticsPage from 'uiSrc/pages/analytics'

import COMMON_ROUTES from './commonRoutes'

export const ANALYTICS_ROUTES: IRoute[] = [
  {
    pageName: PageNames.slowLog,
    path: Pages.slowLog(':instanceId'),
    component: SlowLogPage,
  },
  {
    pageName: PageNames.clusterDetails,
    path: Pages.clusterDetails(':instanceId'),
    component: ClusterDetailsPage,
  },
]

const INSTANCE_ROUTES: IRoute[] = [
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
  {
    pageName: PageNames.pubSub,
    path: Pages.pubSub(':instanceId'),
    component: PubSubPage,
  },
  {
    path: Pages.analytics(':instanceId'),
    component: AnalyticsPage,
    routes: ANALYTICS_ROUTES,
  },
]

const ROUTES: IRoute[] = [
  {
    path: Pages.home,
    exact: true,
    component: HomePage,
    isAvailableWithoutAgreements: true,
  },
  ...COMMON_ROUTES,
  {
    path: Pages.redisEnterpriseAutodiscovery,
    component: RedisClusterDatabasesPage,
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
    path: '/:instanceId',
    component: InstancePage,
    routes: INSTANCE_ROUTES,
  },
]

export default ROUTES
