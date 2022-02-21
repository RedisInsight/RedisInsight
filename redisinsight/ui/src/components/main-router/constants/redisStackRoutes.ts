import { PageNames, Pages, IRoute } from 'uiSrc/constants'
import {
  BrowserPage, InstancePage, SettingsPage,
} from 'uiSrc/pages'
import WorkbenchPage from 'uiSrc/pages/workbench'
import EditConnection from 'uiSrc/pages/redisStack/components/edit-connection'

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

export default [
  {
    path: Pages.home,
    exact: true,
    component: EditConnection,
  },
  {
    path: Pages.settings,
    component: SettingsPage,
  },
  {
    path: '/:instanceId',
    protected: true,
    component: InstancePage,
    routes: INSTANCE_ROUTES,
  },
]
