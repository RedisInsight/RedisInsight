import { IRoute } from 'uiSrc/constants'
import { Maybe, Nullable } from 'uiSrc/utils'
import DEFAULT_ROUTES from 'uiSrc/components/main-router/constants/defaultRoutes'

export const findRouteByPathname = (routes: IRoute[], pathname: string): Maybe<IRoute> => {
  let findRoute

  // eslint-disable-next-line no-restricted-syntax
  for (const route of routes) {
    if (new RegExp(`${pathname}$`).test(route.path)) {
      return route
    }

    if (route.routes) {
      findRoute = findRouteByPathname(route.routes, pathname)
      if (findRoute) {
        return findRoute
      }
    }
  }

  return findRoute
}

export const getRedirectionPage = (pageInput: string, databaseId?: string): Nullable<string> => {
  let page = pageInput.replace(/^\//, '')
  try {
    const pageUrl = new URL(page, window.location.origin)
    const { pathname, searchParams } = pageUrl

    if (searchParams.has('guidePath')) {
      page += '&insights=open'
    }

    const foundRoute = findRouteByPathname(DEFAULT_ROUTES, pathname)
    if (!foundRoute) return null

    if (foundRoute.path.includes(':instanceId')) {
      if (databaseId) {
        return `/${databaseId}/${page}`
      }
      return null
    }

    return `/${page}`
  } catch (_e) {
    return `/${page}`
  }
}

export const getPageName = (databaseId: string, path: string) => path?.replace(`/${databaseId}`, '')
