import { PageNames, Pages, IRoute } from 'uiSrc/constants'
import {
  BrowserPage, InstancePage,
} from 'uiSrc/pages'
import WorkbenchPage from 'uiSrc/pages/workbench'
import SlowLogPage from 'uiSrc/pages/slowLog'
import PubSubPage from 'uiSrc/pages/pubSub'
import EditConnection from 'uiSrc/pages/redisStack/components/edit-connection'
import ClusterDetailsPage from 'uiSrc/pages/clusterDetails'
import AnalyticsPage from 'uiSrc/pages/analytics'
import COMMON_ROUTES from './commonRoutes'

const ANALYTICS_ROUTES: IRoute[] = [
  {
    pageName: PageNames.slowLog,
    protected: true,
    path: Pages.slowLog(':instanceId'),
    component: SlowLogPage,
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
