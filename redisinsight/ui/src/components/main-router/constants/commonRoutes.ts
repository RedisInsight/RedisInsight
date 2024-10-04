import { lazy } from 'react'
import { FeatureFlags, IRoute, Pages } from 'uiSrc/constants'
import SettingsPage from 'uiSrc/pages/settings'

const SentinelDatabasesPage = lazy(() => import('uiSrc/pages/autodiscover-sentinel/sentinel-databases'))
const SentinelDatabasesResultPage = lazy(() => import('uiSrc/pages/autodiscover-sentinel/sentinel-databases-result'))
const SentinelPage = lazy(() => import('uiSrc/pages/autodiscover-sentinel/sentinel'))

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
    featureFlag: FeatureFlags.disabledByEnv,
  },
]

export default ROUTES
