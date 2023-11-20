import { IRoute, Pages } from 'uiSrc/constants'
import { SettingsPage } from 'uiSrc/pages'
import { SentinelDatabasesPage, SentinelDatabasesResultPage, SentinelPage } from 'uiSrc/pages/autodiscover-sentinel'

const ROUTES: IRoute[] = [
  {
    path: Pages.settings,
    component: SettingsPage,
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
]

export default ROUTES
