import { IRoute, PageNames, Pages } from 'uiSrc/constants'
import { LibrariesPage, FunctionsPage } from 'uiSrc/pages/triggered-functions/pages'

export const TRIGGERED_FUNCTIONS_ROUTES: IRoute[] = [
  {
    pageName: PageNames.triggeredFunctionsFunctions,
    path: Pages.triggeredFunctionsFunctions(':instanceId'),
    component: FunctionsPage,
  },
  {
    pageName: PageNames.triggeredFunctionsLibraries,
    path: Pages.triggeredFunctionsLibraries(':instanceId'),
    component: LibrariesPage,
  },
]
