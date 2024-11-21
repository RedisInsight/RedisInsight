import React from 'react';
import { Route, Switch } from 'react-router-dom'
import RouteWithSubRoutes from 'uiSrc/utils/routerWithSubRoutes'
import NotFoundErrorPage from 'uiSrc/pages/not-found-error/NotFoundErrorPage'

export interface Props {
  routes: any[];
}
const InstancePageRouter = ({ routes }: Props) => (
  <Switch>
    {routes.map((route, i) => (
      // eslint-disable-next-line react/no-array-index-key
      <RouteWithSubRoutes key={i} {...route} />
    ))}
    <Route
      path="*"
      component={NotFoundErrorPage}
    />
  </Switch>
)

export default React.memo(InstancePageRouter)
