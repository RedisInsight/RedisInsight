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
import PubSubPage from 'uiSrc/pages/pub-sub'
import AnalyticsPage from 'uiSrc/pages/analytics'
import TriggeredFunctionsPage from 'uiSrc/pages/triggered-functions'
import RdiList from 'uiSrc/pages/rdi/home/RDIList'
import RdiPipeline from 'uiSrc/pages/rdi/pipeline/PipelinePage'
import { ANALYTICS_ROUTES, RDI_ROUTES, TRIGGERED_FUNCTIONS_ROUTES } from './sub-routes'

import COMMON_ROUTES from './commonRoutes'

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
  {
    path: Pages.triggeredFunctions(':instanceId'),
    component: TriggeredFunctionsPage,
    routes: TRIGGERED_FUNCTIONS_ROUTES
  }
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
    path: '/integrate/:rdiInstanceId',
    component: RdiPipeline,
    routes: RDI_ROUTES,
  },
  {
    path: '/:instanceId',
    component: InstancePage,
    routes: INSTANCE_ROUTES,
  },
]

export default ROUTES
