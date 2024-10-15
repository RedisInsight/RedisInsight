import React, { ReactElement, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { appCsrfSelector, fetchCsrfTokenAction } from 'uiSrc/slices/app/csrf'
import { appFeatureFlagsFeaturesSelector, fetchFeatureFlags } from 'uiSrc/slices/app/features';
import PagePlaceholder from '../page-placeholder'

const Csrf = ({ children }: { children: ReactElement }) => {
  const dispatch = useDispatch()
  const { loading, token, csrfEndpoint } = useSelector(appCsrfSelector)
  const features = useSelector(appFeatureFlagsFeaturesSelector)

  useEffect(() => {
    dispatch(fetchCsrfTokenAction(() => dispatch(fetchFeatureFlags())))
  }, [])
  // if csrfEndpoint is defined, that implies that we need
  // the csrf token to be fetched before rendering any of the children.
  // the children will make requests to the backend
  // that need the csrf token to be authorized.
  if (csrfEndpoint) {
    return (!loading && token && features.disabledByEnv !== undefined) ? children : <PagePlaceholder />
  }

  return (!loading && features.disabledByEnv !== undefined) ? children : <PagePlaceholder />
}

export default Csrf
