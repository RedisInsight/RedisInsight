import { EuiResizableContainer } from '@elastic/eui'
import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import cx from 'classnames'

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
  resetRecommendationsHighlighting
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
import { cliSettingsSelector } from 'uiSrc/slices/cli/cli-settings'
import BottomGroupComponents from 'uiSrc/components/bottom-group-components/BottomGroupComponents'
import { monitorSelector, setMonitorInitialState } from 'uiSrc/slices/cli/monitor'
import { setInitialPubSubState } from 'uiSrc/slices/pubsub/pubsub'
import { setBulkActionsInitialState } from 'uiSrc/slices/browser/bulkActions'
import { setClusterDetailsInitialState } from 'uiSrc/slices/analytics/clusterDetails'
import { setDatabaseAnalysisInitialState } from 'uiSrc/slices/analytics/dbAnalysis'
import { resetRedisearchKeysData, setRedisearchInitialState } from 'uiSrc/slices/browser/redisearch'
import { setTriggeredFunctionsInitialState } from 'uiSrc/slices/triggeredFunctions/triggeredFunctions'
import InstancePageRouter from './InstancePageRouter'

import styles from './styles.module.scss'

export interface Props {
  routes: any[];
}

export const firstPanelId = 'main-component'
export const secondPanelId = 'cli'

export interface ResizablePanelSize {
  [firstPanelId]: number
  [secondPanelId]: number
}

export const getDefaultSizes = () => {
  const storedSizes = localStorageService.get(BrowserStorageItem.cliResizableContainer)

  return (
    storedSizes || {
      [firstPanelId]: 60,
      [secondPanelId]: 40,
    }
  )
}

const InstancePage = ({ routes = [] }: Props) => {
  const [sizes, setSizes] = useState<ResizablePanelSize>(getDefaultSizes())
  const [isShouldChildrenRerender, setIsShouldChildrenRerender] = useState(false)

  const dispatch = useDispatch()
  const { instanceId: connectionInstanceId } = useParams<{ instanceId: string }>()
  const { isShowCli, isShowHelper } = useSelector(cliSettingsSelector)
  const { data: modulesData } = useSelector(instancesSelector)
  const { isShowMonitor } = useSelector(monitorSelector)
  const { contextInstanceId } = useSelector(appContextSelector)

  const isShowBottomGroup = isShowCli || isShowHelper || isShowMonitor

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

  useEffect(() => () => {
    setSizes((prevSizes: ResizablePanelSize) => {
      localStorageService.set(BrowserStorageItem.cliResizableContainer, {
        [firstPanelId]: prevSizes[firstPanelId],
        // partially fix elastic resizable issue with zooming
        [secondPanelId]: 100 - prevSizes[firstPanelId],
      })
      return prevSizes
    })
  }, [])

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
    dispatch(resetRecommendationsHighlighting())
    dispatch(setTriggeredFunctionsInitialState())
    setTimeout(() => {
      dispatch(resetOutput())
    }, 0)
  }

  const onPanelWidthChange = useCallback((newSizes: any) => {
    setSizes((prevSizes: any) => ({
      ...prevSizes,
      ...newSizes,
    }))
  }, [])

  if (isShouldChildrenRerender) {
    return null
  }

  return (
    <>
      <EuiResizableContainer
        direction="vertical"
        style={{ height: '100%' }}
        onPanelWidthChange={onPanelWidthChange}
        className={cx({ 'show-cli': isShowBottomGroup })}
      >
        {(EuiResizablePanel, EuiResizableButton) => (
          <>
            <EuiResizablePanel
              id={firstPanelId}
              scrollable={false}
              minSize="55px"
              paddingSize="none"
              size={isShowBottomGroup ? sizes[firstPanelId] : 100}
              wrapperProps={{ className: cx(styles.panelTop, { [styles.mainComponent]: !isShowBottomGroup }) }}
              data-testid={firstPanelId}
            >
              <InstancePageRouter routes={routes} />
            </EuiResizablePanel>

            <EuiResizableButton className={styles.resizableButton} data-test-subj="resize-btn-browser-cli" />

            <EuiResizablePanel
              id={secondPanelId}
              scrollable={false}
              size={isShowBottomGroup ? sizes[secondPanelId] : 0}
              style={{ zIndex: 9 }}
              minSize="140px"
              wrapperProps={{ className: cx(styles.panelBottom) }}
              data-testid={secondPanelId}
              paddingSize="none"
            >
              <BottomGroupComponents />
            </EuiResizablePanel>
          </>
        )}
      </EuiResizableContainer>
    </>
  )
}

export default InstancePage
