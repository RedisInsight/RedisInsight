import { EuiResizableContainer } from '@elastic/eui'
import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import cx from 'classnames'

import {
  fetchInstanceAction,
  getDatabaseConfigInfoAction,
} from 'uiSrc/slices/instances'
import { BrowserStorageItem } from 'uiSrc/constants'
import { localStorageService } from 'uiSrc/services'
import {
  appContextSelector,
  setAppContextConnectedInstanceId,
  setAppContextInitialState,
} from 'uiSrc/slices/app/context'
import { resetKeys } from 'uiSrc/slices/keys'
import { resetOutput } from 'uiSrc/slices/cli/cli-output'
import { cliSettingsSelector } from 'uiSrc/slices/cli/cli-settings'
import BottomGroupComponents from 'uiSrc/components/bottom-group-components/BottomGroupComponents'
import InstancePageRouter from './InstancePageRouter'

import styles from './styles.module.scss'

export interface Props {
  routes: any[];
}

export const firstPanelId = 'main-component'
export const secondPanelId = 'cli'

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
  const [sizes, setSizes] = useState(getDefaultSizes())

  const dispatch = useDispatch()
  const { instanceId: connectionInstanceId } = useParams<{ instanceId: string }>()
  const { isShowCli, isShowHelper } = useSelector(cliSettingsSelector)
  const { contextInstanceId } = useSelector(appContextSelector)

  const isShowBottomGroup = isShowCli || isShowHelper

  useEffect(() => {
    dispatch(fetchInstanceAction(connectionInstanceId))
    dispatch(getDatabaseConfigInfoAction(connectionInstanceId))

    if (contextInstanceId !== connectionInstanceId) {
      resetContext()
    }

    dispatch(setAppContextConnectedInstanceId(connectionInstanceId))
  }, [])

  useEffect(() => () => {
    setSizes((prevSizes: any) => {
      localStorageService.set(BrowserStorageItem.cliResizableContainer, prevSizes)
    })
  }, [])

  const resetContext = () => {
    dispatch(setAppContextInitialState())
    dispatch(resetKeys())
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
            wrapperProps={{ className: cx({ [styles.mainComponent]: !isShowBottomGroup }) }}
            data-testid={firstPanelId}
          >
            <InstancePageRouter routes={routes} />
          </EuiResizablePanel>

          <EuiResizableButton className={styles.resizableButton} data-test-subj="resize-btn-browser-cli" />

          <EuiResizablePanel
            id={secondPanelId}
            scrollable={false}
            size={isShowBottomGroup ? sizes[secondPanelId] : 0}
            style={{ zIndex: 10 }}
            minSize="140px"
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
