import { IRoute, PageNames, Pages } from 'uiSrc/constants'
import ClusterDetailsPage from 'uiSrc/pages/clusterDetails'
import SlowLogPage from 'uiSrc/pages/slowLog'

export const ANALYTICS_ROUTES: IRoute[] = [
  {
    pageName: PageNames.slowLog,
    path: Pages.slowLog(':instanceId'),
    component: SlowLogPage,
  },
  {
    pageName: PageNames.clusterDetails,
    path: Pages.clusterDetails(':instanceId'),
    component: ClusterDetailsPage,
  },
]
