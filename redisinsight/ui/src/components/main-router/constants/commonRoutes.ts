import { Pages } from 'uiSrc/constants'
import { SettingsPage } from 'uiSrc/pages'
import SentinelPage from 'uiSrc/pages/sentinel'
import SentinelDatabasesPage from 'uiSrc/pages/sentinelDatabases'
import SentinelDatabasesResultPage from 'uiSrc/pages/sentinelDatabasesResult'

export default [
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
