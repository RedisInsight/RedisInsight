import { IRoute, PageNames, Pages } from 'uiSrc/constants'
import { LibrariesPage } from 'uiSrc/pages/triggeredFunctions/pages'

export const TRIGGERED_FUNCTIONS_ROUTES: IRoute[] = [
  {
    pageName: PageNames.triggeredFunctionsFunctions,
    path: Pages.triggeredFunctionsFunctions(':instanceId'),
    component: LibrariesPage,
  },
  {
    pageName: PageNames.triggeredFunctionsLibraries,
    path: Pages.triggeredFunctionsLibraries(':instanceId'),
    component: LibrariesPage,
  },
]
