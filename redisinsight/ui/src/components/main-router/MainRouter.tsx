import React from 'react'
import { Redirect, Switch } from 'react-router-dom'
import ROUTES from 'uiSrc/constants/routes'
import extractRouter from 'uiSrc/hoc/extractRouter.hoc'
import { registerRouter } from 'uiSrc/services/routing'
import RouteWithSubRoutes from 'uiSrc/utils/routerWithSubRoutes'

const MainRouter = () => (
  <Switch>
    {ROUTES.map((route, i) => (
      // eslint-disable-next-line react/no-array-index-key
      <RouteWithSubRoutes key={i} {...route} />
    ))}
    <Redirect to="/" />
  </Switch>
)

const MainMount: any = extractRouter(registerRouter)(MainRouter)

export default MainMount
