import React, { ReactElement, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { appInitSelector, initializeAppAction, STATUS_SUCCESS } from 'uiSrc/slices/app/init'
import PagePlaceholder from '../page-placeholder'

const AppInit = ({ children }: { children: ReactElement }) => {
  const dispatch = useDispatch()
  const { status } = useSelector(appInitSelector)

  useEffect(() => {
    dispatch(initializeAppAction())
  }, [])

  return status === STATUS_SUCCESS ? children : <PagePlaceholder />
}

export default AppInit
