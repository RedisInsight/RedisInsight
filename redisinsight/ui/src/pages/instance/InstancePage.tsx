import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useParams } from 'react-router-dom'

import { setInitialAnalyticsSettings } from 'uiSrc/slices/analytics/settings'
import {
  fetchConnectedInstanceAction,
  fetchConnectedInstanceInfoAction,
  fetchInstancesAction,
  getDatabaseConfigInfoAction,
  instancesSelector,
} from 'uiSrc/slices/instances/instances'
import {
  fetchRecommendationsAction,
  setInitialRecommendationsState,
} from 'uiSrc/slices/recommendations/recommendations'
import {
  appContextSelector,
  setAppContextConnectedInstanceId,
  setAppContextInitialState,
  setDbConfig,
} from 'uiSrc/slices/app/context'
import { resetKeys, resetPatternKeysData } from 'uiSrc/slices/browser/keys'
import { BrowserStorageItem } from 'uiSrc/constants'
import { localStorageService } from 'uiSrc/services'
import { resetOutput } from 'uiSrc/slices/cli/cli-output'
import { resetCliHelperSettings } from 'uiSrc/slices/cli/cli-settings'
import { setMonitorInitialState } from 'uiSrc/slices/cli/monitor'
import { setInitialPubSubState } from 'uiSrc/slices/pubsub/pubsub'
import { resetBulkActions } from 'uiSrc/slices/browser/bulkActions'
import { setClusterDetailsInitialState } from 'uiSrc/slices/analytics/clusterDetails'
import { setDatabaseAnalysisInitialState } from 'uiSrc/slices/analytics/dbAnalysis'
import { resetRedisearchKeysData, setRedisearchInitialState } from 'uiSrc/slices/browser/redisearch'
import { setTriggeredFunctionsInitialState } from 'uiSrc/slices/triggeredFunctions/triggeredFunctions'
import { InstancePageTemplate } from 'uiSrc/templates'
import { getPageName } from 'uiSrc/utils/routing'
import InstancePageRouter from './InstancePageRouter'

export interface Props {
  routes: any[]
}

const InstancePage = ({ routes = [] }: Props) => {
  const [isShouldChildrenRerender, setIsShouldChildrenRerender] = useState(false)

  const dispatch = useDispatch()
  const { pathname } = useLocation()

  const { instanceId: connectionInstanceId } = useParams<{ instanceId: string }>()
  const { data: modulesData } = useSelector(instancesSelector)
  const { contextInstanceId } = useSelector(appContextSelector)

  const lastPageRef = useRef<string>()

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

      resetContext()
    }

    dispatch(setAppContextConnectedInstanceId(connectionInstanceId))
    dispatch(setDbConfig(localStorageService.get(BrowserStorageItem.dbConfig + connectionInstanceId)))
  }, [connectionInstanceId])

  useEffect(() => {
    lastPageRef.current = getPageName(connectionInstanceId, pathname)
  }, [pathname])

  useEffect(() => {
    if (isShouldChildrenRerender) setIsShouldChildrenRerender(false)
  }, [isShouldChildrenRerender])

  const resetContext = () => {
    dispatch(resetKeys())
    dispatch(setMonitorInitialState())
    dispatch(setInitialPubSubState())
    dispatch(resetBulkActions())
    dispatch(setAppContextInitialState())
    dispatch(resetPatternKeysData())
    dispatch(resetCliHelperSettings())
    dispatch(resetRedisearchKeysData())
    dispatch(setClusterDetailsInitialState())
    dispatch(setDatabaseAnalysisInitialState())
    dispatch(setInitialAnalyticsSettings())
    dispatch(setRedisearchInitialState())
    dispatch(setInitialRecommendationsState())
    dispatch(setTriggeredFunctionsInitialState())
    setTimeout(() => {
      dispatch(resetOutput())
    }, 0)
  }

  if (isShouldChildrenRerender) {
    return null
  }

  return (
    <InstancePageTemplate>
      <InstancePageRouter routes={routes} />
    </InstancePageTemplate>
  )
}

export default InstancePage
