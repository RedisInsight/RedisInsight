import { EuiResizableContainer } from '@elastic/eui'
import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import cx from 'classnames'

import {
  fetchInstanceAction, fetchInstancesAction,
  getDatabaseConfigInfoAction, instancesSelector,
} from 'uiSrc/slices/instances/instances'
import {
  appContextSelector,
  setAppContextConnectedInstanceId,
  setAppContextInitialState,
} from 'uiSrc/slices/app/context'
import { resetKeysData } from 'uiSrc/slices/browser/keys'
import { BrowserStorageItem } from 'uiSrc/constants'
import { localStorageService } from 'uiSrc/services'
import { resetOutput } from 'uiSrc/slices/cli/cli-output'
import { cliSettingsSelector } from 'uiSrc/slices/cli/cli-settings'
import BottomGroupComponents from 'uiSrc/components/bottom-group-components/BottomGroupComponents'
import { monitorSelector, setMonitorInitialState } from 'uiSrc/slices/cli/monitor'
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

  const dispatch = useDispatch()
  const { instanceId: connectionInstanceId } = useParams<{ instanceId: string }>()
  const { isShowCli, isShowHelper } = useSelector(cliSettingsSelector)
  const { data: modulesData } = useSelector(instancesSelector)
  const { isShowMonitor } = useSelector(monitorSelector)
  const { contextInstanceId } = useSelector(appContextSelector)

  const isShowBottomGroup = isShowCli || isShowHelper || isShowMonitor

  useEffect(() => {
    dispatch(fetchInstanceAction(connectionInstanceId, () => {
      !modulesData.length && dispatch(fetchInstancesAction())
    }))
    dispatch(getDatabaseConfigInfoAction(connectionInstanceId))

    if (contextInstanceId !== connectionInstanceId) {
      resetContext()
    }

    dispatch(setAppContextConnectedInstanceId(connectionInstanceId))
  }, [])

  useEffect(() => () => {
    setSizes((prevSizes: ResizablePanelSize) => {
      localStorageService.set(BrowserStorageItem.cliResizableContainer, {
        [firstPanelId]: prevSizes[firstPanelId],
        // partially fix elastic resizable issue with zooming
        [secondPanelId]: 100 - prevSizes[firstPanelId],
      })
    })
  }, [])

  const resetContext = () => {
    dispatch(setMonitorInitialState())
    dispatch(setAppContextInitialState())
    dispatch(resetKeysData())
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

  return (
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
  )
}

export default InstancePage
