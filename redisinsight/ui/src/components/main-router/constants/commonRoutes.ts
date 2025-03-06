import { lazy } from 'react'
import { IRoute, Pages } from 'uiSrc/constants'
import SettingsPage from 'uiSrc/pages/settings'
import { SentinelDatabasesPage, SentinelDatabasesResultPage } from 'uiSrc/pages/autodiscover-sentinel'
import PageRouter from 'uiSrc/components/page-router/PageRouter'
import { LAZY_LOAD } from '../config'

const LazySettingsPage = lazy(() => import('uiSrc/pages/settings'))
const LazySentinelDatabasesPage = lazy(() => import('uiSrc/pages/autodiscover-sentinel/sentinel-databases'))
const LazySentinelDatabasesResultPage = lazy(() => import('uiSrc/pages/autodiscover-sentinel/sentinel-databases-result'))
const LazyPageRouter = lazy(() => import('uiSrc/components/page-router/PageRouter'))

const ROUTES: IRoute[] = [
  {
    path: Pages.settings,
    component: LAZY_LOAD ? LazySettingsPage : SettingsPage,
  },
  {
    path: Pages.sentinel,
    component: LAZY_LOAD ? LazyPageRouter : PageRouter,
    routes: [
      {
        path: Pages.sentinelDatabases,
        component: LAZY_LOAD ? LazySentinelDatabasesPage : SentinelDatabasesPage,
      },
      {
        path: Pages.sentinelDatabasesResult,
        component: LAZY_LOAD ? LazySentinelDatabasesResultPage : SentinelDatabasesResultPage,
      },
    ],
  },
]

export default ROUTES
