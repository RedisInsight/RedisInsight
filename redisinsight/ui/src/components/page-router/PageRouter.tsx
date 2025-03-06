import React from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import RouteWithSubRoutes from 'uiSrc/utils/routerWithSubRoutes'
import { IRoute } from 'uiSrc/constants'

export interface PageRouterProps {
  routes: IRoute[] | any[];
  fallbackPath?: string;
}

const PageRouter = ({ routes = [], fallbackPath }: PageRouterProps) => (
  <Switch>
    {routes.map((route, i) => (
      // eslint-disable-next-line react/no-array-index-key
      <RouteWithSubRoutes key={i} {...route} />
    ))}
    {fallbackPath && (
      <Route
        path="*"
        render={() => <Redirect to={fallbackPath} />}
      />
    )}
  </Switch>
)

export default React.memo(PageRouter)
