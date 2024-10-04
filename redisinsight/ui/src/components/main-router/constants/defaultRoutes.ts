import { lazy } from 'react'
import { IRoute, FeatureFlags, PageNames, Pages } from 'uiSrc/constants'
import BrowserPage from 'uiSrc/pages/browser'
import WorkbenchPage from 'uiSrc/pages/workbench'
import PubSubPage from 'uiSrc/pages/pub-sub'
import { ANALYTICS_ROUTES, RDI_PIPELINE_MANAGEMENT_ROUTES } from './sub-routes'
import COMMON_ROUTES from './commonRoutes'

const HomePage = lazy(() => import('uiSrc/pages/home'))
const InstancePage = lazy(() => import('uiSrc/pages/instance'))
const RedisCloudDatabasesPage = lazy(() => import('uiSrc/pages/autodiscover-cloud/redis-cloud-databases'))
const RedisCloudDatabasesResultPage = lazy(() => import('uiSrc/pages/autodiscover-cloud/redis-cloud-databases-result'))
const RedisCloudSubscriptionsPage = lazy(() => import('uiSrc/pages/autodiscover-cloud/redis-cloud-subscriptions'))
const RedisClusterDatabasesPage = lazy(() => import('uiSrc/pages/redis-cluster'))
const AnalyticsPage = lazy(() => import('uiSrc/pages/analytics'))
const RedisCloudPage = lazy(() => import('uiSrc/pages/autodiscover-cloud/redis-cloud'))
const RdiPage = lazy(() => import('uiSrc/pages/rdi/home'))
const RdiInstancePage = lazy(() => import('uiSrc/pages/rdi/instance'))
const RdiStatisticsPage = lazy(() => import('uiSrc/pages/rdi/statistics'))
const PipelineManagementPage = lazy(() => import('uiSrc/pages/rdi/pipeline-management'))

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
    featureFlag: FeatureFlags.disabledByEnv,
  },
]

const RDI_INSTANCE_ROUTES: IRoute[] = [
  {
    path: Pages.rdiStatistics(':rdiInstanceId'),
    component: RdiStatisticsPage,
    featureFlag: FeatureFlags.disabledByEnv,
  },
  {
    path: Pages.rdiPipelineManagement(':rdiInstanceId'),
    component: PipelineManagementPage,
    routes: RDI_PIPELINE_MANAGEMENT_ROUTES,
    featureFlag: FeatureFlags.disabledByEnv,
  }
]

const ROUTES: IRoute[] = [
  {
    path: Pages.home,
    exact: true,
    component: HomePage,
    isAvailableWithoutAgreements: true,
    featureFlag: FeatureFlags.disabledByEnv
  },
  ...COMMON_ROUTES,
  {
    path: Pages.redisEnterpriseAutodiscovery,
    component: RedisClusterDatabasesPage,
    featureFlag: FeatureFlags.disabledByEnv,
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
    featureFlag: FeatureFlags.disabledByEnv,
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
