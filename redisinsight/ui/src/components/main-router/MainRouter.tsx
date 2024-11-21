import React, { Suspense, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Route, Switch, useHistory, useLocation } from 'react-router-dom'

import extractRouter from 'uiSrc/hoc/extractRouter.hoc'
import { registerRouter } from 'uiSrc/services/routing'
import RouteWithSubRoutes from 'uiSrc/utils/routerWithSubRoutes'
import { appInfoSelector } from 'uiSrc/slices/app/info'
import { BuildType } from 'uiSrc/constants/env'
import { ConsentsSettingsPopup } from 'uiSrc/components'
import { userSettingsSelector } from 'uiSrc/slices/user/user-settings'
import GlobalUrlHandler from 'uiSrc/components/global-url-handler'

import { localStorageService } from 'uiSrc/services'
import { BrowserStorageItem, Pages } from 'uiSrc/constants'
import { appContextSelector, setCurrentWorkspace } from 'uiSrc/slices/app/context'
import { AppWorkspace } from 'uiSrc/slices/interfaces'
import SuspenseLoader from 'uiSrc/components/main-router/components/SuspenseLoader'
import NotFoundErrorPage from 'uiSrc/pages/not-found-error/NotFoundErrorPage'
import RedisStackRoutes from './components/RedisStackRoutes'
import DEFAULT_ROUTES from './constants/defaultRoutes'
import { startActivityMonitor, stopActivityMonitor } from './activityMonitor'

const MainRouter = () => {
  const { server } = useSelector(appInfoSelector)
  const { isShowConceptsPopup: isShowConsents } = useSelector(userSettingsSelector)
  const { workspace } = useSelector(appContextSelector)

  const dispatch = useDispatch()
  const history = useHistory()
  const { pathname } = useLocation()

  const isRedisStack = server?.buildType === BuildType.RedisStack

  useEffect(() => {
    if (!isRedisStack) {
      const isRdiPageHome = localStorageService.get(BrowserStorageItem.homePage) === Pages.rdi
      if (pathname === Pages.home && isRdiPageHome) {
        history.push(Pages.rdi)
      }
    }

    // notify parent window of last activity
    startActivityMonitor()

    return () => {
      stopActivityMonitor()
    }
  }, [])

  useEffect(() => {
    const isRdiWorkspace = pathname.startsWith(Pages.rdi)
    const isWorkspaceMatch = isRdiWorkspace === (workspace === AppWorkspace.Databases)

    if (isWorkspaceMatch && !pathname.startsWith(Pages.settings)) {
      const newWorkspace = isRdiWorkspace ? AppWorkspace.RDI : AppWorkspace.Databases
      dispatch(setCurrentWorkspace(newWorkspace))
    }

    // before quit - save home page
    window.addEventListener('beforeunload', beforeUnload)
    return () => {
      window.removeEventListener('beforeunload', beforeUnload)
    }
  }, [pathname, workspace])

  const beforeUnload = () => {
    localStorageService.set(BrowserStorageItem.homePage, workspace === AppWorkspace.RDI ? Pages.rdi : Pages.home)
  }

  return (
    <>
      {isShowConsents && (<ConsentsSettingsPopup />)}
      {!isRedisStack && <GlobalUrlHandler />}
      <Suspense fallback={<SuspenseLoader />}>
        <Switch>
          {
            isRedisStack
              ? <RedisStackRoutes databaseId={server?.fixedDatabaseId} />
              : (
                DEFAULT_ROUTES.map((route, i) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <RouteWithSubRoutes key={i} {...route} />
                ))
              )
          }
          <Route
            path="*"
            component={NotFoundErrorPage}
          />
        </Switch>
      </Suspense>
    </>
  )
}

const MainMount: any = extractRouter(registerRouter)(MainRouter)

export default MainMount
