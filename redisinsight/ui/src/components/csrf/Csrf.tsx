import React, { ReactElement, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { appCsrfSelector, fetchCsrfTokenAction } from 'uiSrc/slices/app/csrf'
import PagePlaceholder from '../page-placeholder'

const Csrf = ({ children }: { children: ReactElement }) => {
  const dispatch = useDispatch()
  const { loading, token, csrfEndpoint } = useSelector(appCsrfSelector)

  useEffect(() => {
    dispatch(fetchCsrfTokenAction())
  }, [])

  // if csrfEndpoint is defined, that implies that we need
  // the csrf token to be fetched before rendering any of the children.
  // the children will make requests to the backend
  // that need the csrf token to be authorized.
  if (csrfEndpoint) {
    return !loading && token ? children : <PagePlaceholder />
  }

  return !loading ? children : <PagePlaceholder />
}

export default Csrf
