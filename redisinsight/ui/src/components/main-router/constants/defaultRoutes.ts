import { IRoute, FeatureFlags, PageNames, Pages } from 'uiSrc/constants'
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
import RdiPage from 'uiSrc/pages/rdi/home'
import RdiInstancePage from 'uiSrc/pages/rdi/instance'
import RdiStatisticsPage from 'uiSrc/pages/rdi/statistics'
import PipelineManagementPage from 'uiSrc/pages/rdi/pipeline-management'
import { ANALYTICS_ROUTES, RDI_PIPELINE_MANAGEMENT_ROUTES, TRIGGERED_FUNCTIONS_ROUTES } from './sub-routes'

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

const RDI_INSTANCE_ROUTES: IRoute[] = [
  {
    path: Pages.rdiStatistics(':rdiInstanceId'),
    component: RdiStatisticsPage,
  },
  {
    path: Pages.rdiPipelineManagement(':rdiInstanceId'),
    component: PipelineManagementPage,
    routes: RDI_PIPELINE_MANAGEMENT_ROUTES
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
    path: Pages.rdi,
    component: RdiPage,
    exact: true,
    featureFlag: FeatureFlags.rdi,
  },
  {
    path: Pages.rdiPipeline(':rdiInstanceId'),
    component: RdiInstancePage,
    routes: RDI_INSTANCE_ROUTES,
    featureFlag: FeatureFlags.rdi,
  },
  {
    path: '/:instanceId',
    component: InstancePage,
    routes: INSTANCE_ROUTES
  },
]

export default ROUTES
