import { lazy } from 'react'
import { PageNames, Pages, IRoute } from 'uiSrc/constants'
import BrowserPage from 'uiSrc/pages/browser'
import WorkbenchPage from 'uiSrc/pages/workbench'
import PubSubPage from 'uiSrc/pages/pub-sub'
import COMMON_ROUTES from './commonRoutes'

const InstancePage = lazy(() => import('uiSrc/pages/instance'))
const SlowLogPage = lazy(() => import('uiSrc/pages/slow-log'))
const EditConnection = lazy(() => import('uiSrc/pages/redis-stack/components/edit-connection'))
const ClusterDetailsPage = lazy(() => import('uiSrc/pages/cluster-details'))
const AnalyticsPage = lazy(() => import('uiSrc/pages/analytics'))
const DatabaseAnalysisPage = lazy(() => import('uiSrc/pages/database-analysis'))

const ANALYTICS_ROUTES: IRoute[] = [
  {
    pageName: PageNames.slowLog,
    protected: true,
    path: Pages.slowLog(':instanceId'),
    component: SlowLogPage,
  },
  {
    pageName: PageNames.databaseAnalysis,
    protected: true,
    path: Pages.databaseAnalysis(':instanceId'),
    component: DatabaseAnalysisPage,
  },
  {
    pageName: PageNames.clusterDetails,
    protected: true,
    path: Pages.clusterDetails(':instanceId'),
    component: ClusterDetailsPage,
  },
]

const INSTANCE_ROUTES: IRoute[] = [
  {
    pageName: PageNames.browser,
    protected: true,
    path: Pages.browser(':instanceId'),
    component: BrowserPage,
  },
  {
    pageName: PageNames.workbench,
    protected: true,
    path: Pages.workbench(':instanceId'),
    component: WorkbenchPage,
  },
  {
    pageName: PageNames.pubSub,
    protected: true,
    path: Pages.pubSub(':instanceId'),
    component: PubSubPage,
  },
  {
    path: Pages.analytics(':instanceId'),
    protected: true,
    component: AnalyticsPage,
    routes: ANALYTICS_ROUTES,
  },
]

const ROUTES: IRoute[] = [
  {
    path: Pages.home,
    exact: true,
    component: EditConnection,
  },
  ...COMMON_ROUTES,
  {
    path: '/:instanceId',
    protected: true,
    component: InstancePage,
    routes: INSTANCE_ROUTES,
  },
]

export default ROUTES
