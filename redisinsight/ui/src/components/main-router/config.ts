import { isArray } from 'lodash'
import { IRoute } from 'uiSrc/constants'

export const LAZY_LOAD = window.riConfig?.app?.lazyLoad

export const RI_ROUTES_EXCLUDED_BY_ENV = window.riConfig?.app?.routesExcludedByEnv

export const getRouteIncludedByEnv = (routeDefinition: IRoute | IRoute[]) => {
  if (RI_ROUTES_EXCLUDED_BY_ENV) {
    return []
  }

  return isArray(routeDefinition) ? routeDefinition : [routeDefinition]
}
