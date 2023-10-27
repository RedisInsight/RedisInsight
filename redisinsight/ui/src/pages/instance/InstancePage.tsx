import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

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
} from 'uiSrc/slices/recommendations/recommendations'
import {
  appContextSelector,
  setAppContextConnectedInstanceId,
  setAppContextInitialState,
  setDbConfig,
} from 'uiSrc/slices/app/context'
import { resetPatternKeysData } from 'uiSrc/slices/browser/keys'
import { BrowserStorageItem } from 'uiSrc/constants'
import { localStorageService } from 'uiSrc/services'
import { resetOutput } from 'uiSrc/slices/cli/cli-output'
import { setMonitorInitialState } from 'uiSrc/slices/cli/monitor'
import { setInitialPubSubState } from 'uiSrc/slices/pubsub/pubsub'
import { setBulkActionsInitialState } from 'uiSrc/slices/browser/bulkActions'
import { setClusterDetailsInitialState } from 'uiSrc/slices/analytics/clusterDetails'
import { setDatabaseAnalysisInitialState } from 'uiSrc/slices/analytics/dbAnalysis'
import { resetRedisearchKeysData, setRedisearchInitialState } from 'uiSrc/slices/browser/redisearch'
import { setTriggeredFunctionsInitialState } from 'uiSrc/slices/triggeredFunctions/triggeredFunctions'
import { InstancePageTemplate } from 'uiSrc/templates'
import InstancePageRouter from './InstancePageRouter'

export interface Props {
  routes: any[]
}

const InstancePage = ({ routes = [] }: Props) => {
  const [isShouldChildrenRerender, setIsShouldChildrenRerender] = useState(false)

  const dispatch = useDispatch()
  const { instanceId: connectionInstanceId } = useParams<{ instanceId: string }>()
  const { data: modulesData } = useSelector(instancesSelector)
  const { contextInstanceId } = useSelector(appContextSelector)

  useEffect(() => {
    dispatch(fetchConnectedInstanceAction(connectionInstanceId, () => {
      !modulesData.length && dispatch(fetchInstancesAction())
    }))
    dispatch(getDatabaseConfigInfoAction(connectionInstanceId))
    dispatch(fetchConnectedInstanceInfoAction(connectionInstanceId))
    dispatch(fetchRecommendationsAction(connectionInstanceId))

    if (contextInstanceId && contextInstanceId !== connectionInstanceId) {
      // rerender children from scratch to clear all component states
      setIsShouldChildrenRerender(true)
      requestAnimationFrame(() => setIsShouldChildrenRerender(false))

      resetContext()
    }

    dispatch(setAppContextConnectedInstanceId(connectionInstanceId))
    dispatch(setDbConfig(localStorageService.get(BrowserStorageItem.dbConfig + connectionInstanceId)))
  }, [connectionInstanceId])

  const resetContext = () => {
    dispatch(setMonitorInitialState())
    dispatch(setInitialPubSubState())
    dispatch(setBulkActionsInitialState())
    dispatch(setAppContextInitialState())
    dispatch(resetPatternKeysData())
    dispatch(resetRedisearchKeysData())
    dispatch(setClusterDetailsInitialState())
    dispatch(setDatabaseAnalysisInitialState())
    dispatch(setInitialAnalyticsSettings())
    dispatch(setRedisearchInitialState())
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
