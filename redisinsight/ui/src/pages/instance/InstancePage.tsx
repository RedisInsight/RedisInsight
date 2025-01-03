import React, { useEffect, useRef, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useParams } from 'react-router-dom'
import { Socket } from 'socket.io-client'

import {
  fetchConnectedInstanceAction,
  fetchConnectedInstanceInfoAction,
  fetchInstancesAction,
  getDatabaseConfigInfoAction,
  instancesSelector,
} from 'uiSrc/slices/instances/instances'
import {
  addUnreadRecommendations,
  fetchRecommendationsAction,
} from 'uiSrc/slices/recommendations/recommendations'
import {
  appContextSelector,
  resetDatabaseContext,
  setAppContextConnectedInstanceId,
  setDbConfig,
} from 'uiSrc/slices/app/context'
import { BrowserStorageItem, FeatureFlags } from 'uiSrc/constants'
import { localStorageService } from 'uiSrc/services'
import { InstancePageTemplate } from 'uiSrc/templates'
import { getPageName } from 'uiSrc/utils/routing'
import { resetConnectedInstance as resetRdiConnectedInstance } from 'uiSrc/slices/rdi/instances'
import { loadPluginsAction } from 'uiSrc/slices/app/plugins'
import { appConnectivityError } from 'uiSrc/slices/app/connectivity'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { getSocketApiUrl, Nullable } from 'uiSrc/utils'
import { useIoConnection } from 'uiSrc/services/hooks/useIoConnection'
import { appCsrfSelector } from 'uiSrc/slices/app/csrf'
import { RecommendationsSocketEvents } from 'uiSrc/constants/recommendations'
import InstancePageRouter from './InstancePageRouter'
import InstanceConnectionLost from './instanceConnectionLost'

export interface Props {
  routes: any[]
}

const InstancePage = ({ routes = [] }: Props) => {
  const [isShouldChildrenRerender, setIsShouldChildrenRerender] = useState(false)

  const dispatch = useDispatch()
  const { pathname } = useLocation()

  const { token } = useSelector(appCsrfSelector)
  const { instanceId: connectionInstanceId } = useParams<{ instanceId: string }>()
  const { data: modulesData } = useSelector(instancesSelector)
  const { contextInstanceId } = useSelector(appContextSelector)
  const connectivityError = useSelector(appConnectivityError)
  const { [FeatureFlags.envDependent]: envDependent } = useSelector(appFeatureFlagsFeaturesSelector)

  const lastPageRef = useRef<string>()
  const socketRef = useRef<Nullable<Socket>>(null)

  const socketParams = useMemo(() => ({
    forceNew: true,
    token,
    reconnection: true,
    query: { instanceId: connectionInstanceId }
  }), [token, connectionInstanceId])
  // console.log('socketParams', socketParams)
  const connectIo = useIoConnection(getSocketApiUrl('instance'), socketParams)

  useEffect(() => {
    dispatch(loadPluginsAction())
  }, [])

  useEffect(() => {
    dispatch(fetchConnectedInstanceAction(connectionInstanceId, () => {
      !modulesData.length && dispatch(fetchInstancesAction())
    }))
    dispatch(getDatabaseConfigInfoAction(connectionInstanceId))
    dispatch(fetchConnectedInstanceInfoAction(connectionInstanceId))
    dispatch(fetchRecommendationsAction(connectionInstanceId))

    if (contextInstanceId && contextInstanceId !== connectionInstanceId) {
      // rerender children only if the same page from scratch to clear all component states
      if (lastPageRef.current === getPageName(connectionInstanceId, pathname)) {
        setIsShouldChildrenRerender(true)
      }

      dispatch(resetDatabaseContext())
    }

    dispatch(setAppContextConnectedInstanceId(connectionInstanceId))
    dispatch(setDbConfig(localStorageService.get(BrowserStorageItem.dbConfig + connectionInstanceId)))

    // clear rdi connection
    dispatch(resetRdiConnectedInstance())

    // instance websocket
    try {
      socketRef.current?.disconnect()
    } catch {
      // ignore errors
    }

    socketRef.current = connectIo()

    socketRef.current.on(RecommendationsSocketEvents.Recommendation, (data) => {
      dispatch(addUnreadRecommendations(data))
    })

    return () => {
      socketRef.current?.disconnect()
    }
  }, [connectionInstanceId])

  useEffect(() => {
    lastPageRef.current = getPageName(connectionInstanceId, pathname)
  }, [pathname])

  useEffect(() => {
    if (isShouldChildrenRerender) {
      dispatch(resetDatabaseContext())
      setIsShouldChildrenRerender(false)
    }
  }, [isShouldChildrenRerender])

  if (isShouldChildrenRerender) {
    return null
  }

  return (
    <InstancePageTemplate>
      {
        !envDependent?.flag && connectivityError
          ? <InstanceConnectionLost />
          : <InstancePageRouter routes={routes} />
      }
    </InstancePageTemplate>
  )
}

export default InstancePage
