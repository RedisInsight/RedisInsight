import React, { ReactElement, useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  appInitSelector,
  initializeAppAction,
  STATUS_FAIL,
  STATUS_INITIAL,
  STATUS_SUCCESS,
} from 'uiSrc/slices/app/init'
import ConnectivityError from 'uiSrc/components/connectivity-error/ConnectivityError'
import SuspenseLoader from 'uiSrc/components/main-router/components/SuspenseLoader'

type Props = {
  children: ReactElement
  onSuccess?: () => void,
  onFail?: () => void,
}

const AppInit = ({ children, onSuccess, onFail }: Props) => {
  const dispatch = useDispatch()
  const {
    status,
    error = 'Something went wrong, please try again later',
  } = useSelector(appInitSelector)

  const initApp = useCallback(() => dispatch(initializeAppAction(onSuccess, onFail)), [])

  useEffect(() => {
    if (status === STATUS_INITIAL) {
      initApp()
    }
  }, [])

  if (status === STATUS_FAIL) {
    return <ConnectivityError isLoading={false} onRetry={initApp} error={error} />
  }

  return status === STATUS_SUCCESS ? children : <SuspenseLoader />
}

export default AppInit
