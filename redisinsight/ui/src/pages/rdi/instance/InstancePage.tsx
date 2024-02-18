import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useParams } from 'react-router-dom'

import {
  appContextSelector,
  resetDatabaseContext,
} from 'uiSrc/slices/app/context'
import { IRoute } from 'uiSrc/constants'
import { localStorageService } from 'uiSrc/services'
import { getPageName } from 'uiSrc/utils/routing'
import {
  fetchConnectedInstanceAction,
  resetConnectedInstance as resetRdiConnectedInstance
} from 'uiSrc/slices/rdi/instances'
import InstancePageRouter from './InstancePageRouter'

export interface Props {
  routes: IRoute[]
}

const RdiInstancePage = ({ routes = [] }: Props) => {
  const [isShouldChildrenRerender, setIsShouldChildrenRerender] = useState(false)

  const dispatch = useDispatch()
  const { pathname } = useLocation()

  const { rdiInstanceId: connectionRdiInstanceId } = useParams<{ rdiInstanceId: string }>()
  const { contextInstanceId } = useSelector(appContextSelector)

  const lastPageRef = useRef<string>()

  useEffect(() => {
    dispatch(fetchConnectedInstanceAction(connectionRdiInstanceId))

    if (contextInstanceId && contextInstanceId !== connectionRdiInstanceId) {
      dispatch(fetchConnectedInstanceAction(connectionRdiInstanceId))

      // rerender children only if the same page from scratch to clear all component states
      // if (lastPageRef.current === getPageName(connectionRdiInstanceId, pathname)) {
      //   setIsShouldChildrenRerender(true)
      // }

      dispatch(resetRdiConnectedInstance())
    }

    // dispatch(setAppContextConnectedInstanceId(connectionInstanceId))
    // dispatch(setDbConfig(localStorageService.get(BrowserStorageItem.dbConfig + connectionInstanceId)))

    // clear database context
    dispatch(resetDatabaseContext())
  }, [connectionRdiInstanceId])

  // useEffect(() => {
  //   lastPageRef.current = getPageName(connectionRdiInstanceId, pathname)
  // }, [pathname])

  useEffect(() => {
    if (isShouldChildrenRerender) setIsShouldChildrenRerender(false)
  }, [isShouldChildrenRerender])

  if (isShouldChildrenRerender) {
    return null
  }

  return (
    // TODO add rdi page template
    <InstancePageRouter routes={routes} />
  )
}

export default RdiInstancePage
