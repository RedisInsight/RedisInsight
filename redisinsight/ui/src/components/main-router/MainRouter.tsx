import React from 'react'
import { useSelector } from 'react-redux'
import { Switch } from 'react-router-dom'

import extractRouter from 'uiSrc/hoc/extractRouter.hoc'
import { registerRouter } from 'uiSrc/services/routing'
import RouteWithSubRoutes from 'uiSrc/utils/routerWithSubRoutes'
import { appInfoSelector } from 'uiSrc/slices/app/info'
import { BuildType } from 'uiSrc/constants/env'
import { ConsentsSettingsPopup } from 'uiSrc/components'
import { userSettingsSelector } from 'uiSrc/slices/user/user-settings'
import GlobalUrlHandler from 'uiSrc/components/global-url-handler'

import RedisStackRoutes from './components/RedisStackRoutes'
import DEFAULT_ROUTES from './constants/defaultRoutes'

const MainRouter = () => {
  const { server } = useSelector(appInfoSelector)
  const { isShowConceptsPopup: isShowConsents } = useSelector(userSettingsSelector)

  const isRedisStack = server?.buildType === BuildType.RedisStack

  return (
    <>
      {isShowConsents && (<ConsentsSettingsPopup />)}
      {!isRedisStack && <GlobalUrlHandler />}
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
      </Switch>
    </>
  )
}

const MainMount: any = extractRouter(registerRouter)(MainRouter)

export default MainMount
