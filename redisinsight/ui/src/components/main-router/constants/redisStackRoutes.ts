import { PageNames, Pages, IRoute } from 'uiSrc/constants'
import {
  BrowserPage, InstancePage,
} from 'uiSrc/pages'
import WorkbenchPage from 'uiSrc/pages/workbench'
import EditConnection from 'uiSrc/pages/redisStack/components/edit-connection'
import COMMON_ROUTES from './commonRoutes'

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
