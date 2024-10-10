import { IRoute } from 'uiSrc/constants'

export const LAZY_LOAD = window.riConfig?.app?.lazyLoad

export const ROUTES_EXCLUDED_BY_ENV = window.riConfig?.app?.routesExcludedByEnv

export const getRouteIncludedByEnv = (routeDefinition: IRoute[]) => {
  if (ROUTES_EXCLUDED_BY_ENV) {
    return []
  }

  return routeDefinition
}
