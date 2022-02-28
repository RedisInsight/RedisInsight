import React from 'react'
import { Redirect, Route } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { userSettingsSelector } from 'uiSrc/slices/user/user-settings'
import { IRoute } from 'uiSrc/constants'

const PrivateRoute = (route: IRoute) => {
  const { path, exact, routes } = route
  const { isShowConceptsPopup: haveToAcceptAgreements } = useSelector(userSettingsSelector)
  return (
    <Route
      path={path}
      exact={exact}
      render={(props) =>
        (!haveToAcceptAgreements ? (
          // pass the sub-routes down to keep nesting
          <route.component {...props} routes={routes} />
        ) : <Redirect to="/" />)}
    />
  )
}

const RouteWithSubRoutes = (route: IRoute) => {
  const { isAvailableWithoutAgreements, path, exact, routes } = route
  return (!isAvailableWithoutAgreements ? PrivateRoute(route)
    : (
      <Route
        path={path}
        exact={exact}
        render={(props) => (
          // pass the sub-routes down to keep nesting
          <route.component {...props} routes={routes} />
        )}
      />
    ))
}

export default RouteWithSubRoutes
